import { z } from 'zod';

const COMMON_FIELDS = z.object({
  COMPANY_EMAIL_FROM: z.string(),
  COMPANY_EMAIL_TEMPLATE_TYPE: z.string().default('simple').optional(),
  COMPANY_EMAIL_TEMPLATE: z.string().optional(),
  COMPANY_POSTAL_ADDRESS: z.string().optional(),
  COMPANY_POSTAL_CITY: z.string().optional(),
  COMPANY_POSTAL_COUNTRY: z.string().optional(),
});

const CUSTOM_MAIL_SERVICE_SCHEMA = COMMON_FIELDS.extend({
  DEFAULT_EMAIL_SERVICE: z.literal('custom'),
  MAIL_SERVICE: z.string(),
  MAIL_PORT: z.string(),
  MAIL_USER: z.string(),
  MAIL_PASS: z.string(),
  MAIL_HOST: z.string(),
});

const AWS_SES_SCHEMA = COMMON_FIELDS.extend({
  DEFAULT_EMAIL_SERVICE: z.literal('SES'),
  AWS_SES_ACCESS_KEY_ID: z.string(),
  AWS_SES_SECRET_ACCESS_KEY: z.string(),
  AWS_REGION: z.string(),
  AWS_SES_CONFIG_SET: z.string(),
});

const SENDGRID_SCHEMA = COMMON_FIELDS.extend({
  DEFAULT_EMAIL_SERVICE: z.literal('sendgrid'),
  SENDGRID_API_KEY: z.string(),
  SENDGRID_SUBUSER: z.string().optional(),
  SENDGRID_WEBHOOK_PUBLIC_KEY: z.string().optional(),
});

const MAIL_CONFIG_SCHEMA = z.discriminatedUnion('DEFAULT_EMAIL_SERVICE', [
  CUSTOM_MAIL_SERVICE_SCHEMA,
  AWS_SES_SCHEMA,
  SENDGRID_SCHEMA,
]);

export { MAIL_CONFIG_SCHEMA };
