import { TFormData } from '@/settings/mail-config/types';
import { TFunction } from 'i18next';

export const MAIL_CONFIG_FIELDS: (t: TFunction) => TFormData = (t) => {
  return {
  common: [
    {
      name: 'COMPANY_EMAIL_FROM',
      inputType: 'input',
      type: 'email',
      label: t('email'),
      description: t('email-desc'),
    },
    {
      name: 'COMPANY_EMAIL_TEMPLATE_TYPE',
      inputType: 'select',
      label: t('type'),
      description: t('type-desc'),
      options: ['simple', 'custom'],
    },
    {
      name: 'COMPANY_EMAIL_TEMPLATE',
      inputType: 'editor',
      label: t('template'),
      description: t('temp-desc'),
    },
    {
      name: 'DEFAULT_EMAIL_SERVICE',
      inputType: 'select',
      label: t('default-email-service'),
      description: t('default-email-service-desc'),
      options: ['SES', 'custom'],
    },
  ],
  custom: [
    {
      name: 'MAIL_SERVICE',
      inputType: 'input',
      type: 'input',
      label: 'Mail Service Name',
      description: '',
    },
    {
      name: 'MAIL_PORT',
      inputType: 'input',
      type: 'input',
      label: 'Port',
      description: '',
    },
    {
      name: 'MAIL_USER',
      inputType: 'input',
      type: 'input',
      label: 'Username',
      description: '',
    },
    {
      name: 'MAIL_PASS',
      inputType: 'input',
      type: 'input',
      label: 'Password',
      description: '',
    },
    {
      name: 'MAIL_HOST',
      inputType: 'input',
      type: 'input',
      label: 'Host',
      description: '',
    },
  ],
  SES: [
    {
      name: 'AWS_SES_ACCESS_KEY_ID',
      inputType: 'input',
      type: 'input',
      label: 'AWS SES Access Key id',
      description: '',
    },
    {
      name: 'AWS_SES_SECRET_ACCESS_KEY',
      inputType: 'input',
      type: 'input',
      label: 'AWS SES Secret Access Key',
      description: '',
    },
    {
      name: 'AWS_REGION',
      inputType: 'input',
      type: 'input',
      label: 'AWS Region',
      description: '',
    },
    {
      name: 'AWS_SES_CONFIG_SET',
      inputType: 'input',
      type: 'input',
      label: 'AWS SES Config Set',
      description: '',
    },
  ],
}}
