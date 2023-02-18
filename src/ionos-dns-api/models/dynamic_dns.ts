/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type dynamic_dns = {
  /**
   * DynDns configuration identifier.
   */
  bulkId?: string;
  /**
   * Use the url with GET to update the ips of (sub)domains. Query parameters: ipv4, ipv6.
   */
  updateUrl?: string;
  domains?: Array<string>;
  /**
   * Dynamic Dns description.
   */
  description?: string;
};

