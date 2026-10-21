import type { CredentialMetadata, CredentialTemplate } from './types';

type ProviderSetup = {
  logo?: string;
  docs: string;
  instructions: string[];
  defaults?: Record<string, string>;
  placeholders?: Record<string, string>;
};

export const CONNECTION_CATEGORIES = [
  { id: 'ai', label: 'AI providers' },
  { id: 'storage', label: 'File storage' },
  { id: 'email', label: 'Email' },
] as const;

export const CONNECTION_PROVIDERS: Record<string, ProviderSetup> = {
  openai: {
    logo: '/assets/openai.webp',
    docs: 'https://platform.openai.com/api-keys',
    instructions: [
      'Open your OpenAI project.',
      'Create an API key with the permissions your app needs.',
      'Paste the key below.',
    ],
    defaults: { baseUrl: 'https://api.openai.com/v1' },
    placeholders: { model: 'For example, gpt-5-mini' },
  },
  grok: {
    logo: '/assets/grok.webp',
    docs: 'https://console.x.ai/',
    instructions: [
      'Open the xAI console.',
      'Create an API key for your team.',
      'Paste the key below.',
    ],
    defaults: { baseUrl: 'https://api.x.ai/v1' },
    placeholders: { model: 'For example, grok-4.3' },
  },
  kimi: {
    logo: '/assets/kimi.webp',
    docs: 'https://platform.moonshot.ai/console/api-keys',
    instructions: [
      'Open the Moonshot AI console.',
      'Create an API key.',
      'Paste the key below.',
    ],
    defaults: { baseUrl: 'https://api.moonshot.ai/v1' },
    placeholders: { model: 'For example, kimi-k2.5' },
  },
  'kimi-code': {
    logo: '/assets/kimi.webp',
    docs: 'https://www.kimi.com/code',
    instructions: [
      'Open your Kimi Coding account.',
      'Create a Coding API key.',
      'Paste the key below.',
    ],
    defaults: { baseUrl: 'https://api.kimi.com/coding' },
    placeholders: { model: 'For example, kimi-for-coding' },
  },
  'cloudflare-ai-gateway': {
    logo: '/assets/cloudflare.webp',
    docs: 'https://developers.cloudflare.com/ai-gateway/get-started/',
    instructions: [
      'Create an AI Gateway in Cloudflare.',
      'Copy your account ID and gateway ID.',
      'Create an API token with AI Gateway access.',
    ],
    placeholders: {
      gatewayId: 'Your gateway name',
      model: 'For example, openai/gpt-5-mini',
    },
  },
  'cloudflare-r2': {
    logo: '/assets/cloudflare.webp',
    docs: 'https://developers.cloudflare.com/r2/api/tokens/',
    instructions: [
      'Choose a bucket in Cloudflare R2.',
      'Create an R2 API token scoped to that bucket.',
      'Copy the access key ID and secret access key.',
    ],
    placeholders: { bucket: 'Your existing bucket name' },
  },
  s3: {
    docs: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/security-iam.html',
    instructions: [
      'Choose your S3 bucket and region.',
      'Create an IAM access key restricted to the bucket.',
      'Copy the access key ID and secret access key.',
    ],
    placeholders: {
      region: 'For example, us-east-1',
      bucket: 'Your existing bucket name',
    },
  },
  smtp: {
    docs: 'https://nodemailer.com/smtp',
    instructions: [
      'Find your provider’s outgoing mail settings.',
      'Use an app password if your provider requires one.',
      'Enter the host, port and sign-in details below.',
    ],
    defaults: { port: '587', secure: 'false' },
    placeholders: { host: 'smtp.example.com', username: 'you@company.com' },
  },
  'amazon-ses': {
    docs: 'https://docs.aws.amazon.com/ses/latest/dg/setting-up.html',
    instructions: [
      'Verify a sender identity in Amazon SES.',
      'Create an IAM access key with the required SES permissions.',
      'Use the same AWS region as your sender identity.',
    ],
    placeholders: { region: 'For example, us-east-1' },
  },
  sendgrid: {
    logo: '/assets/connections/sendgrid.svg',
    docs: 'https://www.twilio.com/docs/sendgrid/ui/account-and-settings/api-keys',
    instructions: [
      'Open Settings → API Keys in SendGrid.',
      'Create a restricted key with Mail Send access.',
      'Paste the key below.',
    ],
  },
};

export const providerName = (
  id: string,
  templates: CredentialTemplate[],
): string =>
  templates.find((template) => template.id === id)?.name ||
  { generic: 'Custom connection', 'ai-api-key': 'Custom AI provider' }[id] ||
  id;

export const categoryName = (id: string): string =>
  CONNECTION_CATEGORIES.find((category) => category.id === id)?.label || id;

export const connectionIsConfigured = (
  connection: CredentialMetadata,
): boolean =>
  connection.fields.length > 0 &&
  connection.fields.every((field) => !field.required || field.hasValue);
