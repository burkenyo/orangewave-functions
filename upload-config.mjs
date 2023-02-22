import * as fs from "node:fs/promises";
import * as process from "node:process";
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

let configJson = await fs.readFile(`config-secrets/${configSecretName}.json`, { encoding: "utf-8" });
// round-trip JSON to minify the config
configJson = JSON.stringify(JSON.parse(configJson));

const client = new SecretClient(`https://${options.keyVaultName}.vault.azure.net/`, new DefaultAzureCredential());

try {
  const { value: existingconfigJson, properties: configSecretProperties } = await client.getSecret(configSecretName);

  if (existingconfigJson == configJson) {
    console.error("Config is unchanged. Aborting...");

    process.exit(1);
  }

  await client.updateSecretProperties(configSecretName, configSecretProperties.version, { enabled: false });
} catch (ex) {
  if (ex.code != "SecretNotFound") {
    throw ex
  }
}

await client.setSecret(configSecretName, configJson, { contentType: "application/json" });
