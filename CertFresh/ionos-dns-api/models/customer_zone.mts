/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { record_response } from './record_response.mjs';
import type { zoneTypes } from './zoneTypes.mjs';

export type customer_zone = {
  /**
   * The zone id.
   */
  id?: string;
  /**
   * The zone name
   */
  name?: string;
  type?: zoneTypes;
  records?: Array<record_response>;
};

