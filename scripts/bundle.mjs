// Copyright © 2023 Samuel Justin Gabay
// Licensed under the GNU Affero Public License, Version 3

import fs from "node:fs/promises";
import * as utils from "./utils.mjs";

await utils.normalizeCwd();

const fileOrDirsToCopy = [
  "node_modules",
  "package.json",
  "package-lock.json",
  "host.json",
  "local.settings.json",
  ".funcignore",
];

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
