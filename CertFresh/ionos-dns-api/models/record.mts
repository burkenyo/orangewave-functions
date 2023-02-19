/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { recordTypes } from './recordTypes.mjs';

export type record = {
  name?: string;
  type?: recordTypes;
  content?: string;
  /**
   * Time to live for the record, recommended 3600.
   */
  ttl?: number;
  prio?: number;
  /**
   * When is true, the record is not visible for lookup.
   */
  disabled?: boolean;
};

