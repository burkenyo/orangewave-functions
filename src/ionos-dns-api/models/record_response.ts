/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { recordTypes } from './recordTypes';

export type record_response = {
  id?: string;
  name?: string;
  /**
   * Root zone name.
   */
  rootName?: string;
  type?: recordTypes;
  content?: string;
  /**
   * The date of the last change formatted as yyyy-MM-dd'T'HH:mm:ss.SSS'Z'
   */
  changeDate?: string;
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

