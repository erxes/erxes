export const MAX_RATE_LIMIT_RETRIES = 5;

export const MAX_NETWORK_RETRIES = 2;

export const IDEMPOTENT_METHODS = new Set([
  'GET',
  'HEAD',
  'OPTIONS',
  'PUT',
  'PATCH',
  'DELETE',
]);
