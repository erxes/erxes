// Local intake caps, informed by Viber's media model; inbound limits still need
// live verification. Outbound delivery needs its own checks, notably on iOS.
// https://creators.viber.com/docs/bots-api/data-models/message
export const VIBER_INCOMING_MEDIA_MAX_BYTES = {
  picture: 3 * 1024 * 1024,
  video: 26 * 1024 * 1024,
  file: 50 * 1024 * 1024,
} as const;

export type ViberMediaType = keyof typeof VIBER_INCOMING_MEDIA_MAX_BYTES;

export const VIBER_HEALTH_STATUSES = {
  PENDING: 'pending',
  HEALTHY: 'healthy',
  UNHEALTHY: 'unHealthy',
} as const;

export type ViberHealthStatus =
  (typeof VIBER_HEALTH_STATUSES)[keyof typeof VIBER_HEALTH_STATUSES];

export const VIBER_MEDIA_SETTINGS_ID = 'media';

// Documented incoming media hosts, not an exhaustive provider CDN inventory.
// https://docs.gupshup.io/docs/viber-message-types-inbound
export const VIBER_DEFAULT_MEDIA_HOSTNAMES = [
  'dl-media.viber.com',
  'content.cdn.viber.com',
] as const;
