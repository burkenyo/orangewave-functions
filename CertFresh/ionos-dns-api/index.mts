/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export { ApiError } from './core/ApiError.mjs';
export { CancelablePromise, CancelError } from './core/CancelablePromise.mjs';
export { OpenAPI } from './core/OpenAPI.mjs';
export type { OpenAPIConfig } from './core/OpenAPI.mjs';

export type { customer_zone } from './models/customer_zone.mjs';
export type { dyn_dns_request } from './models/dyn_dns_request.mjs';
export type { dynamic_dns } from './models/dynamic_dns.mjs';
export type { error } from './models/error.mjs';
export type { errors } from './models/errors.mjs';
export type { record } from './models/record.mjs';
export type { record_response } from './models/record_response.mjs';
export type { record_update } from './models/record_update.mjs';
export { recordTypes } from './models/recordTypes.mjs';
export type { zone } from './models/zone.mjs';
export { zoneTypes } from './models/zoneTypes.mjs';

export { DynamicDnsClient } from './services/DynamicDnsClient.mjs';
export { RecordsClient } from './services/RecordsClient.mjs';
export { ZonesClient } from './services/ZonesClient.mjs';
