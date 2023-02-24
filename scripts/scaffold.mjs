// Copyright © 2023 Samuel Justin Gabay
// Licensed under the GNU Affero Public License, Version 3

import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { program } from "commander";
import openApi from "openapi-typescript-codegen";
import * as utils from "./utils.mjs";

await utils.normalizeCwd();

const options = program
  .option("--force")
  .parse()
  .opts();

const OUT_DIR = "src/CertFresh/ionos-dns-api";

if (await utils.exists(OUT_DIR)) {
  if (options.force) {
    await fs.rm(OUT_DIR, { recursive: true, force: true })
  } else {
    console.log("Scaffolded API is already generated and might be overwritten with different code. "
      + "Use --force to override.");

    process.exit(1);
  }
}

const response = await fetch("https://developer.hosting.ionos.com/assets/kms-swagger-specs/dns.yaml")
const specContent = await response.text();

const tempDir = await fs.mkdtemp(os.tmpdir())

try {
  const fileName = path.join(tempDir, "ionos-dns-api.yaml");

  await fs.writeFile(fileName, specContent)

  await openApi.generate({
    input: fileName,
    output: OUT_DIR,
    postfix: "Client",
    indent: openApi.Indent.SPACE_2
  });

  for (const fileName of await utils.readdirRecurse(OUT_DIR)) {
    // update file name to comply with ES6 TS module naming convention
    const newFileName = fileName.replace(/\.ts$/, ".mts");
    await fs.rename(fileName, newFileName);

    let fileLines = (await fs.readFile(newFileName, { encoding: "utf8" })).split("\n");
    for (let i = 0; i < fileLines.length; i++) {
      fileLines[i] = processLine(fileLines[i]);
    }

    const localFileName = path.relative(OUT_DIR, newFileName);
    fileLines = processFile(localFileName, fileLines);

    await fs.writeFile(newFileName, fileLines.join("\n"));
  }
} finally {
  await fs.rm(tempDir, { recursive: true, force: true });
}

// These helper functions are a bit hacky, but effective.
// Their purpose is to modify the generated source to:
//   • Comply with ES6 module import conventions
//   • Produce instantiable clients with constructor-injectible settings rather than static clients
//   • Fix a few small syntax/import errors coming from TS

function processLine(currentLine) {
  // fixup imports/exports to include module file extension
  if (/^(import|export) .* from/.test(currentLine)) {
    currentLine = currentLine.replace(/(\w+)';$/, "$1.mjs';");
  }
  // fixup generic arrow functions: “const fn = <T>(param1” -> “const fn = <T,>(param1”
  else if (/(export)? const \w+ = (async )?<T>\(\w+/) {
    currentLine = currentLine.replace(/const (\w+) = (async )?<T>/, "const $1 = $2<T,>");
  }

  return currentLine;
}

function processFile(fileName, fileLines) {
  // add reference to make TypeScript ok with the fetch API and the FormData class,
  // which it doesn’t know Node now supports
  if (fileName == "core/request.mts") {
    fileLines[0] = '/// <reference lib="dom" />\n' + fileLines[0];
  }
  // fixup individual client clases
  else if (/services\/\w+Client.mts/.test(fileName)) {
    for (let i = 0; i < fileLines.length; i++) {
      fileLines[i] = processClientLine(fileLines[i]);
    }
  }

  return fileLines;
}

function processClientLine(currentLine) {
  // make all methods instance methods
  if (/^ +public static \w+\(/.test(currentLine)) {
    currentLine = currentLine.replace(/public static (\w+)/, "public $1");
  }
  // use instance config rather than global config
  else if (/^ +return __request\(OpenAPI, {$/.test(currentLine)) {
    currentLine = currentLine.replace("OpenAPI", "this.#config");
  }
  // update config import
  else if (/^import { OpenAPI }/.test(currentLine)) {
    currentLine = currentLine.replace(/^import { OpenAPI }/, "import { OpenAPI, type OpenAPIConfig }");
  }
  // add constructor and instance config member
  else if (/^export class \w+Client {$/.test(currentLine)) {
    const constructorCode = `
  readonly #config: OpenAPIConfig;

  constructor(apiKey: string) {
    this.#config = {
      ...OpenAPI,
      HEADERS: { "X-API-Key": apiKey }
    }
  }`;

    currentLine += constructorCode;
  }

  return currentLine;
}
