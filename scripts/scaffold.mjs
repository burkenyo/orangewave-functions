import { existsSync } from "node:fs";
import { exit } from "node:process";
import OpenAPI from "openapi-typescript-codegen";
import * as utils from "./utils.mjs";

await utils.normalizeCwd();

if (existsSync("src/CertFresh/ionos-dns-api") && !process.argv.includes("--force")) {
  console.log("Scaffolded API already generated and has changes that would be overwritten. "
    + "Use --force to override.");

  exit(1);
}

OpenAPI.generate({
  input: "ionos-dns-api.yaml",
  output: "src/CertFresh/ionos-dns-api/",
  postfix: "Client",
  indent: OpenAPI.Indent.SPACE_2
});
