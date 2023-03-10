/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { zoneTypes } from './zoneTypes.mjs';

export type zone = {
  /**
   * The zone name.
   */
  name?: string;
  /**
   * The zone id.
   */
  id?: string;
  type?: zoneTypes;
};

