import * as fs from "node:fs/promises";
import { program } from "commander";
import { SecretClient } from "@azure/keyvault-secrets";
import { DefaultAzureCredential } from "@azure/identity";

const options = program
  .requiredOption("-v, --key-vault-name <string>")
  .requiredOption("-n, --function-name <string>")
  .option("-d, --dev")
  .parse()
  .opts();

const configSecretName = options.functionName + "--config" + (options.dev ? "-dev" : "");

const client = new SecretClient(`https://${options.keyVaultName}.vault.azure.net/`, new DefaultAzureCredential());

const configJson = (await client.getSecret(configSecretName)).value;

try {
  await fs.access("config-secrets");
} catch (ex) {
  if (ex.code != "ENOENT") {
    throw ex;
  }

  await fs.mkdir("config-secrets");
}

// round-trip JSON to pretty-print the config
await fs.writeFile(`config-secrets/${configSecretName}.json`, JSON.stringify(JSON.parse(configJson), null, 2));
