import { Client as AcmeClient, setLogger as setAcmeLogger, directory as acmeDirectory } from "acme-client";
import { AzureFunction, Context } from "@azure/functions"
import { DefaultAzureCredential } from "@azure/identity";
import { CertificateClient } from "@azure/keyvault-certificates";
import { SecretClient } from "@azure/keyvault-secrets";
import { Config } from "./config";
import { Challenger } from "./challenger.mjs";
import { CertRefresher } from "./certRefresher.mjs";
import { RecordsClient, ZonesClient } from "./ionos-dns-api/index.mjs";

const timerTrigger: AzureFunction = async function (context: Context): Promise<void> {
    const vaultUrl = process.env.AZURE_KEY_VAULT_URL;

    if (!vaultUrl) {
      throw new Error("Env var AZURE_KEY_VAULT_URL not set!");
    }

    const cred = new DefaultAzureCredential();
    const secretClient = new SecretClient(vaultUrl, cred);
    const certClient = new CertificateClient(vaultUrl, cred);

    const configSecret = await secretClient.getSecret("CertFresh--config")

    if (!configSecret.value) {
      throw new Error("Config not defined!");
    }

    const config = JSON.parse(configSecret.value) as Config;

    setAcmeLogger(msg => msg.startsWith('[auto]') && context.log(msg));

    const acmeClient = new AcmeClient({
      directoryUrl: acmeDirectory.letsencrypt.production,
      accountUrl: config.letsEncrypt.accountUrl,
      accountKey: config.letsEncrypt.accountKey
    });

    const zonesClient = new ZonesClient(config.ionos.apiKey);
    const recordService = new RecordsClient(config.ionos.apiKey);

    const challenger = new Challenger(zonesClient, recordService);
    const certRefresher = new CertRefresher(acmeClient, certClient, challenger, context.log);

    for (const zone of config.zones) {
      await certRefresher.refresh(zone);
    }
};

export default timerTrigger;
