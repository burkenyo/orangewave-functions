import { RecordsClient, recordTypes, ZonesClient } from "./ionos-dns-api/index.mjs";

export class Challenger {
  readonly #zonesClient: ZonesClient;
  readonly #recordsClient: RecordsClient;
  readonly #zoneChallenges = new Map<string, { zoneId: string, challengeRecordId: string }>();

  constructor(zonesClient: ZonesClient, recordsClient: RecordsClient) {
    this.#zonesClient = zonesClient;
    this.#recordsClient = recordsClient;
  }

  async createDnsRecord(zone: string, challengeText: string): Promise<void> {
    const zones = await this.#zonesClient.getZones();

    const zoneId = zones.find(z => z.name ==  zone)?.id;
    if (!zoneId) {
      throw new Error(`DNS zone ${zone} not found!`);
    }

    const recordResonses = await this.#recordsClient.createRecords(zoneId, [{
      name: "_acme-challenge." + zone,
      type: recordTypes.TXT,
      content: challengeText,
      ttl: 60
    }]);

    const challengeRecordId = recordResonses[0].id;

    if (!challengeRecordId) {
      throw new Error(`Challenge record for DNS zone ${zone} not created!`);
    }

    this.#zoneChallenges.set(zoneId, { zoneId, challengeRecordId })
  }

  async deleteDnsRecord(zone: string): Promise<void> {
    const { zoneId, challengeRecordId } = this.#zoneChallenges.get(zone) ?? { };

    if (!zoneId || !challengeRecordId) {
      throw new Error(`Challenge record for DNS zone ${zone} not created!`);
    }

    await this.#recordsClient.deleteRecord(zoneId, challengeRecordId);
  }
}
