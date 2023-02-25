// Copyright © 2023 Samuel Justin Gabay
// Licensed under the GNU Affero Public License, Version 3

import process from "node:process";
import path from "node:path";
import url from "node:url";
import fs from "node:fs/promises";
import child_process from "node:child_process";

export async function exists(path) {
  try {
    await fs.access(path);

    return true;
  } catch (ex) {
    if (ex.code == "ENOENT") {
      return false;
    }

    throw ex;
  }
}

export async function normalizeCwd() {
  let newCwd = path.dirname(url.fileURLToPath(import.meta.url));

  while (true) {
    process.chdir(newCwd);

    if (await exists("package.json")) {
      return true;
    }

    const oldCwd = newCwd;
    newCwd = path.dirname(newCwd);

    if (oldCwd == newCwd) {
      // I‘ve hit the filesystem root. let Node throw a system error.
      await fs.access("package.json");
    }
  }
}

export async function readdirRecurse(dir) {
  const subdirs = await fs.readdir(dir);
  const files = await Promise.all(subdirs.map(async (subdir) => {
    const res = path.resolve(dir, subdir);
    return (await fs.stat(res)).isDirectory() ? readdirRecurse(res) : res;
  }));
  return files.reduce((a, f) => a.concat(f), []);
}

export function isRunningInGithubActions() {
  return process.env.GITHUB_ACTIONS == "true";
}

export function invokeCommand(name, args) {
  const proc = child_process.spawn(name, args)
  const stdoutChunks = [];
  const stderrChucks = [];

  proc.stdout.on("data", c => stdoutChunks.push(c));
  proc.stderr.on("data", c => stderrChucks.push(c));

  return new Promise((resolve, reject) => {
    proc.on("close", code => {
      if (code != 0) {
        const message = String(Buffer.concat(stderrChucks)).trim();

        reject(new Error(message == "" ? `Process ${name} exited with code ${code}!` : message));
      }

      const output = String(Buffer.concat(stdoutChunks)).trim();

      resolve(output == "" ? null : output);
    });

    proc.on("error", error => {
      reject(error);
    });
  })
}

let gitInfo = null;

export async function getGitInfo () {
  if (gitInfo == null) {
    gitInfo = {
      branch: await invokeCommand("git", ["branch", "--show-current"]),
      commit: await invokeCommand("git", ["rev-parse", "--short", "HEAD"]),
      isDirty: !!(await invokeCommand("git", ["status", "--short"])),
    }
  }

  return gitInfo;
}
