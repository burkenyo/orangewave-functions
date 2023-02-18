import { Client as AcmeClient, setLogger as setAcmeLogger, directory as acmeDirectory } from "acme-client";
import { Challenger } from "./challenger";
import { CertificateClient } from "@azure/keyvault-certificates";
import { SecretClient } from "@azure/keyvault-secrets";
import { DefaultAzureCredential } from "@azure/identity";
import { ZonesClient, RecordsClient } from "./ionos-dns-api"
import { CertRefresher } from "./certRefresher";
import type { Config } from "./config";
import { config as loadEnv } from "dotenv";

loadEnv();
const vaultUrl = process.env.AZURE_KEY_VAULT_URL;

if (!vaultUrl) {
  throw new Error("Env var AZURE_KEY_VAULT_URL not set!");
}

const cred = new DefaultAzureCredential();
const secretClient = new SecretClient(vaultUrl, cred);
const certClient = new CertificateClient(vaultUrl, cred);

const configSecret = await secretClient.getSecret("cert-fresh--config")

if (!configSecret.value) {
  throw new Error("Config not defined!");
}

const config = JSON.parse(configSecret.value) as Config;

setAcmeLogger(msg => msg.startsWith('[auto]') && console.log(msg));

const acmeClient = new AcmeClient({
  directoryUrl: acmeDirectory.letsencrypt.production,
  accountUrl: config.letsEncrypt.accountUrl,
  accountKey: config.letsEncrypt.accountKey
});

const zonesClient = new ZonesClient(config.ionos.apiKey);
const recordService = new RecordsClient(config.ionos.apiKey);

const challenger = new Challenger(zonesClient, recordService);
const certRefresher = new CertRefresher(acmeClient, certClient, challenger);

for (const zone of config.zones) {
  certRefresher.refresh(zone);
}
