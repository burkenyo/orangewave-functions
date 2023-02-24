// Copyright © 2023 Samuel Justin Gabay
// Licensed under the GNU Affero Public License, Version 3

import fs from "node:fs/promises";
import { program } from "commander";
import { SecretClient } from "@azure/keyvault-secrets";
import { DefaultAzureCredential } from "@azure/identity";
import * as utils from "./utils.mjs";

await utils.normalizeCwd();

const options = program
  .requiredOption("-v, --key-vault-name <string>")
  .requiredOption("-n, --function-name <string>")
  .option("-d, --dev")
  .parse()
  .opts();

const configSecretName = options.functionName + "--config" + (options.dev ? "-dev" : "");

const client = new SecretClient(`https://${options.keyVaultName}.vault.azure.net/`, new DefaultAzureCredential());

const configJson = (await client.getSecret(configSecretName)).value;

if (!await utils.exists("config-secrets")) {
  await fs.mkdir("config-secrets");
}

// round-trip JSON to pretty-print the config
await fs.writeFile(`config-secrets/${configSecretName}.json`, JSON.stringify(JSON.parse(configJson), null, 2));
