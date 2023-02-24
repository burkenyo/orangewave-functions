// Copyright © 2023 Samuel Justin Gabay
// Licensed under the GNU Affero Public License, Version 3

import process from "node:process";
import path from "node:path";
import url from "node:url";
import fs from "node:fs/promises";

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
