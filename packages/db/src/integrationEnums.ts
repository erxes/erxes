export const INTEGRATION_CATEGORIES = [
  'email',
  'messaging',
  'payments',
  'banks',
  'tax',
  'sales',
  'marketing',
  'developer',
  'productivity',
  'social',
] as const;

export const INTEGRATION_CONNECTION_STATUSES = ['active', 'disabled'] as const;

export const INTEGRATION_AUTH_KINDS = ['keys', 'oauth'] as const;

export const INTEGRATION_SUBSCRIPTION_STATUSES = ['syncing', 'listening', 'broken'] as const;

export const APP_TRIGGER_DELIVERIES = ['hook', 'poll'] as const;

export const OAUTH_CLIENT_SOURCES = ['server', 'organization'] as const;

export const VAULT_HOLDERS = [
  'email',
  'file-bucket',
  'webhook',
  'assistant',
  'audit-stream',
  'two-step',
  'plugin',
] as const;

export const INTEGRATION_STATES = ['connected', 'off', 'attention', 'not-set-up'] as const;

export const INTEGRATION_FIELD_TYPES = ['text', 'secret', 'switch', 'select', 'hidden'] as const;

export const TELEGRAM_PARSE_MODES = ['MarkdownV2', 'HTML'] as const;

export const FACEBOOK_MESSAGE_RECIPIENTS = ['person', 'commenter'] as const;
