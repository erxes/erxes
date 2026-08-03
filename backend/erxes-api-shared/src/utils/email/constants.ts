import { TEmailProviderName } from './types';

export const EMAIL_PROVIDER_CONFIG_CODES = [
  'DEFAULT_EMAIL_SERVICE',

  'AWS_SES_ACCESS_KEY_ID',
  'AWS_SES_SECRET_ACCESS_KEY',
  'AWS_REGION',
  'AWS_SES_CONFIG_SET',

  'SENDGRID_API_KEY',
  'SENDGRID_SUBUSER',

  'MAIL_SERVICE',
  'MAIL_HOST',
  'MAIL_PORT',
  'MAIL_USER',
  'MAIL_PASS',
] as const;

export const DEFAULT_EMAIL_PROVIDER: TEmailProviderName = 'SES';

export const SENDGRID_API_BASE_URL = 'https://api.sendgrid.com/v3';

export const SES_DKIM_CNAME_SUFFIX = 'dkim.amazonses.com';
