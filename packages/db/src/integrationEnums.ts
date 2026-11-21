/** The custom integrations' value lists, kept as `./enums` is: one `as const` array each, no imports. */

export const INTEGRATION_PROGRAM_KINDS = ['action', 'incoming'] as const;

export const INTEGRATION_FIELD_TYPES = [
  'text',
  'longtext',
  'number',
  'boolean',
  'date',
  'select',
  'json',
] as const;

export const INTEGRATION_REQUEST_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const;

export const INTEGRATION_SIGNATURE_ENCODINGS = ['hex', 'base64'] as const;

export const INTEGRATION_ACCOUNT_STATUSES = ['healthy', 'broken'] as const;

export const INTEGRATION_CONNECT_TYPES = ['form', 'redirect'] as const;

export const INTEGRATION_FORM_FIELD_TYPES = [
  'text',
  'secret',
  'number',
  'boolean',
  'select',
] as const;

export const INTEGRATION_HOOKS = ['connected', 'check', 'disconnect'] as const;

export const INTEGRATION_CATEGORIES = ['email', 'messaging', 'payments', 'tax'] as const;
