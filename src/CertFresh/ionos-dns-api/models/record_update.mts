/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type record_update = {
  /**
   * When is true, the record is not visible for lookup.
   */
  disabled?: boolean;
  content?: string;
  /**
   * Time to live for the record, recommended 3600.
   */
  ttl?: number;
  prio?: number;
};

