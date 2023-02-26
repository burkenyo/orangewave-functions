// Copyright © 2023 Samuel Justin Gabay
// Licensed under the GNU Affero Public License, Version 3

import fs from "node:fs/promises";
import * as utils from "./utils.mjs";

await utils.normalizeCwd();

const isRunningInGithubActions = utils.isRunningInGithubActions();
if (isRunningInGithubActions) {
  console.log("bundle: GitHub Actions detected!");
}

// this assumes tsc has already populated the bundle dir with the compiled code
const fileOrDirsToCopy = [
  "node_modules",
  "host.json",
  ".funcignore",
];

if (!isRunningInGithubActions) {
  const localOnlyFilesOrDirsToCopy = [
    "package.json",
    "local.settings.json",
  ]

  fileOrDirsToCopy.push(...localOnlyFilesOrDirsToCopy);
}

if (await utils.exists("bundle")) {
  for (const fileOrDir of fileOrDirsToCopy) {
    await fs.rm("bundle/" + fileOrDir, { recursive: true, force: true });
  }
} else {
  await fs.mkdir("bundle");
}

for (const fileOrDir of fileOrDirsToCopy) {
  await fs.cp(fileOrDir, "bundle/" + fileOrDir, { recursive: true });
}

// flatten src directory
await fs.cp("src", "bundle", { recursive: true });

// get git info for referencing in the Azure portal
const gitInfo = await utils.getGitInfo();

await fs.writeFile("bundle/git-info.json", JSON.stringify(gitInfo, null, 2));
