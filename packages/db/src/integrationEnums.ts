/** Integration lists, kept with `./enums` (which re-exports them). */

/** In the order Settings › Integrations lists them. */
export const INTEGRATION_CATEGORIES = [
  'payments',
  'banks',
  'social',
  'messaging',
  'email',
  'government',
] as const;

export const CORE_CONNECTION_STATUSES = ['active', 'disabled'] as const;

export const PLUGIN_CONNECTION_STATUSES = ['active', 'attention'] as const;

export const INTEGRATION_CONNECTION_STATUSES = ['active', 'disabled', 'attention'] as const;

export const VAULT_HOLDERS = [
  'email',
  'file-bucket',
  'webhook',
  'assistant',
  'audit-stream',
  'two-step',
] as const;

export const INTEGRATION_STATES = ['connected', 'off', 'attention', 'not-set-up'] as const;

export const INTEGRATION_FIELD_TYPES = ['text', 'secret', 'switch', 'select', 'hidden'] as const;
