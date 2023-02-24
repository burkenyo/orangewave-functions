// Copyright © 2023 Samuel Justin Gabay
// Licensed under the GNU Affero Public License, Version 3

import { type Client as AcmeClient, crypto } from "acme-client";
import { type CertificateClient } from "@azure/keyvault-certificates";
import { type Challenger } from "./challenger.mjs";
import { type Logger } from "../utils.mjs";
import { DateTime, Duration } from "luxon";

export class CertRefresher {
  readonly #acmeClient: AcmeClient;
  readonly #certClient: CertificateClient;
  readonly #challenger: Challenger
  readonly #log: Logger;

  constructor(acmeClient: AcmeClient, certClient: CertificateClient, challenger: Challenger, logger: Logger) {
    this.#acmeClient = acmeClient;
    this.#certClient = certClient;
    this.#challenger = challenger;
    this.#log = logger;
  }

  async refresh(zone: string, minimumTimeTilExpiry = Duration.fromISO("P20D") ): Promise<boolean> {
    const certName = zone.replaceAll(".", "-");

    checkCert: try {
      const existingCert = await this.#certClient.getCertificate(certName);

      const timeTilExpiry = DateTime.fromJSDate(existingCert.properties.expiresOn!).diffNow();

      if (timeTilExpiry >= minimumTimeTilExpiry) {
        this.#log(`Existing cert for ${zone} still valid for ${timeTilExpiry.toFormat("d")} days.`);

        return false;
      }
    }
    catch (ex: any) {
      if (ex && ex.code == "CertificateNotFound") {
        break checkCert;
      }

      throw ex;
    }

    const [privateKey, csr] = await crypto.createCsr({ commonName: "*." + zone }, await crypto.createPrivateEcdsaKey());

    const newCert = await this.#acmeClient.auto({
      csr,
      challengePriority: ["dns01"],
      termsOfServiceAgreed: true,
      challengeCreateFn: (_, __, challengeText) => this.#challenger.createDnsRecord(zone, challengeText),
      challengeRemoveFn: () => this.#challenger.deleteDnsRecord(zone),
    });

    const fullCert = String(privateKey) + newCert;

    await this.#certClient.importCertificate(certName, Buffer.from(fullCert));

    return true;
  }
}
