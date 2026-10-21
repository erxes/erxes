import type { CredentialField, CredentialFieldType, CredentialTemplate } from './types';

const field = (
  key: string,
  label: string,
  type: CredentialFieldType = 'text',
  required = false,
): CredentialField => ({ key, label, type, required, secret: type === 'password' });

export const credentialTemplates: CredentialTemplate[] = [
  {
    id: 'generic', name: 'Generic', category: 'custom',
    description: 'Custom key/value credentials. All values are encrypted.', fields: [],
  },
  {
    id: 'ai-api-key', name: 'AI API key', category: 'ai',
    description: 'A named AI provider connection.',
    fields: [field('provider', 'Provider', 'text', true), field('apiKey', 'API key', 'password', true),
      field('baseUrl', 'Base URL', 'url'), field('model', 'Model')],
  },
  {
    id: 'smtp', name: 'SMTP', category: 'email', description: 'An SMTP server connection.',
    fields: [field('host', 'Host', 'text', true), field('port', 'Port', 'number', true),
      field('username', 'Username', 'text', true), field('password', 'Password', 'password', true),
      field('secure', 'Use TLS', 'boolean')],
  },
  {
    id: 's3', name: 'S3-compatible storage', category: 'storage',
    description: 'An S3-compatible bucket connection.',
    fields: [field('bucket', 'Bucket', 'text', true), field('region', 'Region', 'text', true),
      field('accessKeyId', 'Access key ID', 'password', true),
      field('secretAccessKey', 'Secret access key', 'password', true),
      field('endpoint', 'Endpoint', 'url'), field('sessionToken', 'Session token', 'password')],
  },
];
