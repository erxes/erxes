import { TOutgoingWebhookAuth } from '@/automations/components/builder/nodes/actions/webhooks/states/outgoingWebhookFormSchema';

export const JWT_AUTH_ALGORITHMS = [
  'HS256',
  'HS384',
  'HS512',
  'RS256',
  'RS384',
  'RS512',
  'ES256',
  'ES384',
  'ES512',
  'PS256',
  'PS384',
  'PS512',
  'EdDSA',
] as const;

export const OUTGOING_WEBHOOK_HEADER_VALUE_TYPES = [
  'fixed',
  'expression',
] as const;

export const OUTGOING_WEBHOOK_AUTH_PLACEMENTS = [
  'header',
  'query',
  'body',
] as const;

export const OUTGOIN_WEBHOOK_RETRY_BACKOFFS = [
  'none',
  'linear',
  'exponential',
] as const;

export const OUTGOING_WEBHOOK_FORM_DEFAULT_VALUES = {
  method: 'POST',
  url: '',
  queryParams: [],
  body: {},
  auth: { type: 'none' } as Extract<TOutgoingWebhookAuth, { type: 'none' }>,
  headers: [],
  options: {
    followRedirect: false,
    retry: { attempts: 0, delay: 1000, backoff: 'none' },
  },
};

export const JSON_PROPERTY_TYPE_OPTIONS = [
  'string',
  'number',
  'boolean',
  'null',
  'object',
  'array',
  'expression',
] as const;
