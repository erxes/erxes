import type { CredentialMetadata, CredentialTemplate } from '../types';

export const templates: CredentialTemplate[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    category: 'ai',
    description: 'Use your OpenAI account for AI models and assistants.',
    fields: [
      {
        key: 'apiKey',
        label: 'API key',
        type: 'password',
        secret: true,
        required: true,
      },
      {
        key: 'baseUrl',
        label: 'API base URL',
        type: 'url',
        secret: false,
        required: false,
      },
      {
        key: 'model',
        label: 'Default model',
        type: 'text',
        secret: false,
        required: false,
      },
    ],
  },
  {
    id: 'smtp',
    name: 'SMTP',
    category: 'email',
    description: 'An SMTP server connection.',
    fields: [
      {
        key: 'host',
        label: 'SMTP host',
        type: 'text',
        secret: false,
        required: true,
      },
      {
        key: 'port',
        label: 'Port',
        type: 'number',
        secret: false,
        required: true,
      },
      {
        key: 'username',
        label: 'Username',
        type: 'text',
        secret: false,
        required: true,
      },
      {
        key: 'password',
        label: 'Password',
        type: 'password',
        secret: true,
        required: true,
      },
      {
        key: 'secure',
        label: 'Implicit TLS',
        type: 'boolean',
        secret: false,
        required: false,
      },
    ],
  },
  {
    id: 'cloudflare-r2',
    name: 'Cloudflare R2',
    category: 'storage',
    description: 'Set up access to a Cloudflare R2 bucket.',
    fields: [
      {
        key: 'accountId',
        label: 'Account ID',
        type: 'text',
        secret: false,
        required: true,
      },
      {
        key: 'bucket',
        label: 'Bucket name',
        type: 'text',
        secret: false,
        required: true,
      },
      {
        key: 'accessKeyId',
        label: 'Access key ID',
        type: 'password',
        secret: true,
        required: true,
      },
      {
        key: 'secretAccessKey',
        label: 'Secret access key',
        type: 'password',
        secret: true,
        required: true,
      },
    ],
  },
  { id: 'generic', name: 'Generic', category: 'custom', fields: [] },
];

export const savedConnection: CredentialMetadata = {
  _id: 'connection-a',
  reference: 'cred_test-reference',
  name: 'Production OpenAI',
  templateId: 'openai',
  category: 'ai',
  description: '',
  createdAt: '2026-10-22T00:00:00Z',
  updatedAt: '2026-10-22T00:00:00Z',
  fields: templates[0].fields.map((field) => ({
    ...field,
    hasValue: field.required || field.key === 'baseUrl',
  })),
};
