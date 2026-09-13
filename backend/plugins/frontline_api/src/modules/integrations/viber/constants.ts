// Local intake caps, informed by Viber's media model; inbound limits still need
// live verification. Outbound delivery needs its own checks, notably on iOS.
// https://creators.viber.com/docs/bots-api/data-models/message
export const VIBER_INCOMING_MEDIA_MAX_BYTES = {
  picture: 3 * 1024 * 1024,
  video: 26 * 1024 * 1024,
  file: 50 * 1024 * 1024,
} as const;

export type ViberMediaType = keyof typeof VIBER_INCOMING_MEDIA_MAX_BYTES;
