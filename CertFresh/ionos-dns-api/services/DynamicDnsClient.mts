/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { dyn_dns_request } from '../models/dyn_dns_request.mjs';
import type { dynamic_dns } from '../models/dynamic_dns.mjs';

import type { CancelablePromise } from '../core/CancelablePromise.mjs';
import { OpenAPI, OpenAPIConfig } from '../core/OpenAPI.mjs';
import { request as __request } from '../core/request.mjs';

export class DynamicDnsClient {
  readonly #config: OpenAPIConfig;

  constructor(apiKey: string) {
    this.#config = {
      ...OpenAPI,
      HEADERS: { "X-API-Key": apiKey }
    }
  }

  /**
   * Activate Dynamic Dns for a bundle of (sub)domains. The url from response will be used to update the ips of the (sub)domains.
   * The following quota applies: 2 requests per minute per IP address.
   *
   * @param requestBody Dynamic Dns configuration.
   * @returns dynamic_dns Succesful response.
   * @throws ApiError
   */
  public activateDynDns(
    requestBody: dyn_dns_request,
  ): CancelablePromise<dynamic_dns> {
    return __request(this.#config, {
      method: 'POST',
      url: '/v1/dyndns',
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        400: `Bad request.`,
        401: `Unauthorized request.`,
        429: `Rate limit excedeed.`,
        500: `Internal server error.`,
      },
    });
  }

  /**
   * Disable Dynamic Dns.
   * The following quota applies: 2 requests per minute per IP address.
   *
   * @returns any Succesful response.
   * @throws ApiError
   */
  public disableDynDns(): CancelablePromise<any> {
    return __request(this.#config, {
      method: 'DELETE',
      url: '/v1/dyndns',
      errors: {
        401: `Unauthorized request.`,
        429: `Rate limit excedeed.`,
        500: `Internal server error.`,
      },
    });
  }

  /**
   * Update Dynamic Dns for bulk id.
   * The following quota applies: 2 requests per minute per IP address.
   *
   * @param bulkId Dynamic Dns configuration identifier.
   * @param requestBody Dynamic Dns configuration.
   * @returns any Succesful response.
   * @throws ApiError
   */
  public updateDynDns(
    bulkId: string,
    requestBody: dyn_dns_request,
  ): CancelablePromise<any> {
    return __request(this.#config, {
      method: 'PUT',
      url: '/v1/dyndns/{bulkId}',
      path: {
        'bulkId': bulkId,
      },
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        400: `Bad request.`,
        401: `Unauthorized request.`,
        403: `Forbidden request.`,
        404: `DynDns not found error.`,
        429: `Rate limit excedeed.`,
        500: `Internal server error.`,
      },
    });
  }

  /**
   * Disable Dynamic Dns for bulk id.
   * The following quota applies: 2 requests per minute per IP address.
   *
   * @param bulkId Dynamic Dns configuration identifier.
   * @returns any Succesful response.
   * @throws ApiError
   */
  public deleteDynDns(
    bulkId: string,
  ): CancelablePromise<any> {
    return __request(this.#config, {
      method: 'DELETE',
      url: '/v1/dyndns/{bulkId}',
      path: {
        'bulkId': bulkId,
      },
      errors: {
        401: `Unauthorized request.`,
        429: `Rate limit excedeed.`,
        500: `Internal server error.`,
      },
    });
  }

}
