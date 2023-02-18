/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export { ApiError } from './core/ApiError';
export { CancelablePromise, CancelError } from './core/CancelablePromise';
export { OpenAPI } from './core/OpenAPI';
export type { OpenAPIConfig } from './core/OpenAPI';

export type { customer_zone } from './models/customer_zone';
export type { dyn_dns_request } from './models/dyn_dns_request';
export type { dynamic_dns } from './models/dynamic_dns';
export type { error } from './models/error';
export type { errors } from './models/errors';
export type { record } from './models/record';
export type { record_response } from './models/record_response';
export type { record_update } from './models/record_update';
export { recordTypes } from './models/recordTypes';
export type { zone } from './models/zone';
export { zoneTypes } from './models/zoneTypes';

export { DynamicDnsClient } from './services/DynamicDnsClient';
export { RecordsClient } from './services/RecordsClient';
export { ZonesClient } from './services/ZonesClient';
