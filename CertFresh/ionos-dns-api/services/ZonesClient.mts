/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { customer_zone } from '../models/customer_zone.mjs';
import type { record } from '../models/record.mjs';
import type { zone } from '../models/zone.mjs';

import type { CancelablePromise } from '../core/CancelablePromise.mjs';
import { OpenAPI, OpenAPIConfig } from '../core/OpenAPI.mjs';
import { request as __request } from '../core/request.mjs';

export class ZonesClient {
  readonly #config: OpenAPIConfig;

  constructor(apiKey: string) {
    this.#config = {
      ...OpenAPI,
      HEADERS: { "X-API-Key": apiKey }
    }
  }

  /**
   * Returns list of customer zones.
   * @returns zone Succesful response.
   * @throws ApiError
   */
  public getZones(): CancelablePromise<Array<zone>> {
    return __request(this.#config, {
      method: 'GET',
      url: '/v1/zones',
      errors: {
        401: `Unauthorized request.`,
        500: `Internal server error.`,
      },
    });
  }

  /**
   * Returns a customer zone.
   * @param zoneId The id of the customer zone.
   * @param suffix The FQDN used to filter all the record names that end with it.
   * @param recordName The record names that should be included (same as name field of Record)
   * @param recordType A comma-separated list of record types that should be included
   * @returns customer_zone Succesful response.
   * @throws ApiError
   */
  public getZone(
    zoneId: string,
    suffix?: string,
    recordName?: string,
    recordType?: string,
  ): CancelablePromise<customer_zone> {
    return __request(this.#config, {
      method: 'GET',
      url: '/v1/zones/{zoneId}',
      path: {
        'zoneId': zoneId,
      },
      query: {
        'suffix': suffix,
        'recordName': recordName,
        'recordType': recordType,
      },
      errors: {
        401: `Unauthorized request.`,
        500: `Internal server error.`,
      },
    });
  }

  /**
   * Replaces all records of the same name and type with the ones provided.
   * @param zoneId The id of the customer zone.
   * @param requestBody records
   * @returns any Succesful response.
   * @throws ApiError
   */
  public patchZone(
    zoneId: string,
    requestBody: Array<record>,
  ): CancelablePromise<any> {
    return __request(this.#config, {
      method: 'PATCH',
      url: '/v1/zones/{zoneId}',
      path: {
        'zoneId': zoneId,
      },
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        400: `Bad request.`,
        401: `Unauthorized request.`,
        500: `Internal server error.`,
      },
    });
  }

  /**
   * Replaces all records in the zone with the ones provided
   * @param zoneId The id of the customer zone.
   * @param requestBody records
   * @returns any Succesful response.
   * @throws ApiError
   */
  public updateZone(
    zoneId: string,
    requestBody: Array<record>,
  ): CancelablePromise<any> {
    return __request(this.#config, {
      method: 'PUT',
      url: '/v1/zones/{zoneId}',
      path: {
        'zoneId': zoneId,
      },
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        400: `Bad request.`,
        401: `Unauthorized request.`,
        500: `Internal server error.`,
      },
    });
  }

}
