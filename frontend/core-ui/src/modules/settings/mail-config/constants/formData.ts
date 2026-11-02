import { TFormData } from '@/settings/mail-config/types';
import { TFunction } from 'i18next';

export const MAIL_CONFIG_FIELDS: (t: TFunction) => TFormData = (t) => {
  return {
    sending: [
      {
        name: 'COMPANY_EMAIL_FROM',
        inputType: 'input',
        type: 'email',
        label: t('email'),
        description: t('email-desc'),
        className: 'col-span-2',
      },
      {
        name: 'DEFAULT_EMAIL_SERVICE',
        inputType: 'select',
        label: t('default-email-service'),
        description: t('default-email-service-desc'),
        options: ['SES', 'sendgrid', 'custom'],
        className: 'col-span-2',
      },
    ],
    template: [
      {
        name: 'COMPANY_EMAIL_TEMPLATE_TYPE',
        inputType: 'select',
        label: t('type'),
        description: t('type-desc'),
        options: ['simple', 'custom'],
        className: 'col-span-2',
      },
      {
        name: 'COMPANY_EMAIL_TEMPLATE',
        inputType: 'editor',
        label: t('template'),
        description: t('temp-desc'),
        className: 'col-span-2',
      },
    ],
    postal: [
      {
        name: 'COMPANY_POSTAL_ADDRESS',
        inputType: 'input',
        type: 'input',
        label: t('postal-address'),
        description: t('postal-address-desc'),
        className: 'col-span-2',
      },
      {
        name: 'COMPANY_POSTAL_CITY',
        inputType: 'input',
        type: 'input',
        label: t('postal-city'),
      },
      {
        name: 'COMPANY_POSTAL_COUNTRY',
        inputType: 'input',
        type: 'input',
        label: t('postal-country'),
      },
    ],
    custom: [
      {
        name: 'MAIL_SERVICE',
        inputType: 'input',
        type: 'input',
        label: t('mail-service-name'),
      },
      {
        name: 'MAIL_PORT',
        inputType: 'input',
        type: 'input',
        label: t('port'),
      },
      {
        name: 'MAIL_USER',
        inputType: 'input',
        type: 'input',
        label: t('username'),
      },
      {
        name: 'MAIL_PASS',
        inputType: 'input',
        type: 'password',
        label: t('password'),
      },
      {
        name: 'MAIL_HOST',
        inputType: 'input',
        type: 'input',
        label: t('host'),
        className: 'col-span-2',
      },
    ],
    SES: [
      {
        name: 'AWS_SES_ACCESS_KEY_ID',
        inputType: 'input',
        type: 'input',
        label: 'AWS SES Access Key id',
      },
      {
        name: 'AWS_SES_SECRET_ACCESS_KEY',
        inputType: 'input',
        type: 'password',
        label: 'AWS SES Secret Access Key',
      },
      {
        name: 'AWS_REGION',
        inputType: 'input',
        type: 'input',
        label: 'AWS Region',
      },
      {
        name: 'AWS_SES_CONFIG_SET',
        inputType: 'input',
        type: 'input',
        label: 'AWS SES Config Set',
      },
    ],
    sendgrid: [
      {
        name: 'SENDGRID_API_KEY',
        inputType: 'input',
        type: 'password',
        label: 'SendGrid API Key',
        description: t('sendgrid-api-key-desc'),
      },
      {
        name: 'SENDGRID_SUBUSER',
        inputType: 'input',
        type: 'input',
        label: 'SendGrid Subuser',
        description: t('sendgrid-subuser-desc'),
      },
      {
        name: 'SENDGRID_WEBHOOK_PUBLIC_KEY',
        inputType: 'input',
        type: 'input',
        label: 'SendGrid Webhook Public Key',
        description: t('sendgrid-webhook-key-desc'),
        className: 'col-span-2',
      },
    ],
  };
};
