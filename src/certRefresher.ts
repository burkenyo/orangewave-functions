import { Client as AcmeClient, crypto } from "acme-client";
import { CertificateClient } from "@azure/keyvault-certificates";
import { Challenger } from "./challenger";
import { MILLIS_PER_DAY } from "./utils";

export class CertRefresher {
  readonly #acmeClient: AcmeClient;
  readonly #certClient: CertificateClient;
  readonly #challenger: Challenger

  constructor(acmeClient: AcmeClient, certClient: CertificateClient, challenger: Challenger) {
    this.#acmeClient = acmeClient;
    this.#certClient = certClient;
    this.#challenger = challenger;

  }

  async refresh(zone: string, daysBefore = 20): Promise<boolean> {
    const certName = zone.replaceAll(".", "-");

    try {
      const existingCert = await this.#certClient.getCertificate(certName);

      const daysTilExpiry = (existingCert.properties.expiresOn!.getTime() - Date.now()) / MILLIS_PER_DAY;

      if (daysTilExpiry > daysBefore) {
        console.log(`Existing cert for ${zone} still valid for ${Math.floor(daysTilExpiry)} days.`);

        return false;
      }
    }
    catch (ex: any) {
      if (!ex || ex.constructor.name != "RestError" || ex.code != "CertificateNotFound") {
        throw ex;
      }
    }

    const [privateKey, csr] = await crypto.createCsr({ commonName: "*." + zone });

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
