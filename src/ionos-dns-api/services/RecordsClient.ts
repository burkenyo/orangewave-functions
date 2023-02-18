/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { record } from '../models/record';
import type { record_response } from '../models/record_response';
import type { record_update } from '../models/record_update';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI, OpenAPIConfig } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class RecordsClient {
  readonly #config: OpenAPIConfig;

  constructor(apiKey: string) {
    this.#config = {
      ...OpenAPI,
      HEADERS: { "X-API-Key": apiKey }
    }
  }

  /**
   * Creates records for a customer zone.
   * @param zoneId The id of the customer zone.
   * @param requestBody
   * @returns record_response Records created.
   * @throws ApiError
   */
  public createRecords(
    zoneId: string,
    requestBody: Array<record>,
  ): CancelablePromise<Array<record_response>> {
    return __request(this.#config, {
      method: 'POST',
      url: '/v1/zones/{zoneId}/records',
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
   * Returns the record from the customer zone with the mentioned id.
   * @param zoneId The id of the customer zone.
   * @param recordId The id of the record.
   * @returns record_response Succesful response.
   * @throws ApiError
   */
  public getRecord(
    zoneId: string,
    recordId: string,
  ): CancelablePromise<record_response> {
    return __request(this.#config, {
      method: 'GET',
      url: '/v1/zones/{zoneId}/records/{recordId}',
      path: {
        'zoneId': zoneId,
        'recordId': recordId,
      },
      errors: {
        401: `Unauthorized request.`,
        404: `Record not found.`,
        500: `Internal server error.`,
      },
    });
  }

  /**
   * Delete a record from the customer zone.
   * @param zoneId The id of the customer zone.
   * @param recordId The id of the record.
   * @returns any Succesful response.
   * @throws ApiError
   */
  public deleteRecord(
    zoneId: string,
    recordId: string,
  ): CancelablePromise<any> {
    return __request(this.#config, {
      method: 'DELETE',
      url: '/v1/zones/{zoneId}/records/{recordId}',
      path: {
        'zoneId': zoneId,
        'recordId': recordId,
      },
      errors: {
        401: `Unauthorized request.`,
        404: `Record not found.`,
        500: `Internal server error.`,
      },
    });
  }

  /**
   * Update a record from the customer zone.
   * @param zoneId The id of the customer zone.
   * @param recordId The id of the record.
   * @param requestBody
   * @returns record_response Record updated.
   * @throws ApiError
   */
  public updateRecord(
    zoneId: string,
    recordId: string,
    requestBody: record_update,
  ): CancelablePromise<record_response> {
    return __request(this.#config, {
      method: 'PUT',
      url: '/v1/zones/{zoneId}/records/{recordId}',
      path: {
        'zoneId': zoneId,
        'recordId': recordId,
      },
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        400: `Bad request.`,
        401: `Unauthorized request.`,
        404: `Record not found.`,
        500: `Internal server error.`,
      },
    });
  }

}
