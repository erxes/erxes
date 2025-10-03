import { z } from 'zod';
import { MAIL_CONFIG_SCHEMA } from '@/settings/mail-config/schema';

type TMailConfigForm = z.infer<typeof MAIL_CONFIG_SCHEMA>;

type TCustomMailConfig = {
  DEFAULT_EMAIL_SERVICE: 'custom';
  COMPANY_EMAIL_FROM: string;
  COMPANY_EMAIL_TEMPLATE_TYPE: string;
  COMPANY_EMAIL_TEMPLATE: string;
  MAIL_SERVICE: string;
  MAIL_PORT: string;
  MAIL_USER: string;
  MAIL_PASS: string;
  MAIL_HOST: string;
};

type TSESMailConfig = {
  DEFAULT_EMAIL_SERVICE: 'SES';
  COMPANY_EMAIL_FROM: string;
  COMPANY_EMAIL_TEMPLATE_TYPE: string;
  COMPANY_EMAIL_TEMPLATE: string;
  AWS_SES_ACCESS_KEY_ID: string;
  AWS_SES_SECRET_ACCESS_KEY: string;
  AWS_REGION: string;
  AWS_SES_CONFIG_SET: string;
};

interface TInput {
  name: string;
  inputType: 'input' | 'select' | 'editor';
  type?: string;
  label?: string;
  description?: string;
  options?: string[];
}

type TFormData = {
  [key: string]: TInput[];
};

export {
  TMailConfigForm,
  TCustomMailConfig,
  TSESMailConfig,
  TInput,
  TFormData,
};
