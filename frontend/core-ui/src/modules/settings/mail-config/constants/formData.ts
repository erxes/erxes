import { TFormData } from '@/settings/mail-config/types';
import { TFunction } from 'i18next';

export const MAIL_CONFIG_FIELDS: (t: TFunction) => TFormData = (t) => {
  return {
  common: [
    {
      name: 'COMPANY_EMAIL_FROM',
      inputType: 'input',
      type: 'email',
      label: t('email', 'Email'),
      description: t('email-desc', 'Set an email address you wish to send your internal transactional emails from (e.g. task notifications, team member mentions).'),
    },
    {
      name: 'COMPANY_EMAIL_TEMPLATE_TYPE',
      inputType: 'select',
      label: t('type', 'Type'),
      description: t('type-desc', 'Choose "custom" to change the template of transactional emails.'),
      options: ['simple', 'custom'],
    },
    {
      name: 'COMPANY_EMAIL_TEMPLATE',
      inputType: 'editor',
      label: t('template', 'Template'),
      description: t('temp-desc', 'Your email will be sent with erxes email template.'),
    },
    {
      name: 'DEFAULT_EMAIL_SERVICE',
      inputType: 'select',
      label: t('default-email-service', 'Default email service'),
      description: t('default-email-service-desc', 'Choose your email service name. The default email service is SES.'),
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
