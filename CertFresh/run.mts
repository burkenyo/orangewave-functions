import { Client as AcmeClient, setLogger as setAcmeLogger } from "acme-client";
import { type TokenCredential } from "@azure/identity";
import { CertificateClient } from "@azure/keyvault-certificates";
import { Challenger } from "./challenger.mjs";
import { CertRefresher } from "./certRefresher.mjs";
import { RecordsClient, ZonesClient } from "./ionos-dns-api/index.mjs";
import { type Context, wrap, type AugmentedFunction } from "../shared/utils.mjs";

interface Config {
  readonly azure: {
    readonly keyVaultUrl: string
  }
  readonly letsEncrypt: {
    readonly accountUrl: string,
    readonly accountKey: string,
  }
  readonly ionos: {
    readonly apiKey: string
  }
  readonly zones: readonly string[];
}

const timerTrigger: AugmentedFunction<Config> = async function (
  context: Context, config: Config, azureCredential: TokenCredential
): Promise<void> {
  setAcmeLogger(msg => msg.startsWith('[auto]') && context.log(msg));

  const acmeClient = new AcmeClient({
    directoryUrl: new URL(config.letsEncrypt.accountUrl).origin + "/directory",
    accountUrl: config.letsEncrypt.accountUrl,
    accountKey: config.letsEncrypt.accountKey
  });

  const certClient = new CertificateClient(config.azure.keyVaultUrl, azureCredential);
  const zonesClient = new ZonesClient(config.ionos.apiKey);
  const recordClient = new RecordsClient(config.ionos.apiKey);
  const challenger = new Challenger(zonesClient, recordClient);
  const certRefresher = new CertRefresher(acmeClient, certClient, challenger, context.log);

  for (const zone of config.zones) {
    await certRefresher.refresh(zone);
  }
};

export default wrap(timerTrigger);
