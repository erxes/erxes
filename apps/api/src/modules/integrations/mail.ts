import {
  defineIntegration,
  digits,
  field,
  type Keys,
  secret,
  toggle,
} from '@erxes/plugin-sdk/integrations';
import { z } from 'zod';
import { type MailServer, transportFor } from '~/modules/email/transport';
import type { KeyedIntegration } from './define';

// Mail service: the organisation's own accounts that websites (portals), broadcasts,
// automations and plugins send email through, each picking a connection. Organization email
// (Settings › Organization email) stays erxes' own: invitations, sign-up and sign-in, and
// whatever has no connection picked.

const address = () =>
  field('From address', z.string().trim().toLowerCase().check(z.email()).max(254));

const fromName = () => field('From name', z.string().trim().min(1).max(100)).optional();

/** What sending through a connection needs: its server, secret and From. */
export interface MailClient {
  server: MailServer;
  secret: string;
  from: { name: string | null; address: string };
  /** SES: the configuration set that publishes its events; else empty. */
  configurationSet: string;
}

/** Signs in to the server and says goodbye: wrong credentials or an unreachable host throw. */
const verify = async ({ server, secret: key }: MailClient) => {
  const transport = await transportFor(server, key);

  try {
    await transport.verify();
  } finally {
    transport.close();
  }
};

const SERVER = { smtpHost: '', smtpPort: 587, smtpSecure: false, username: '', region: '' };

const smtp = defineIntegration({
  key: 'smtp',
  name: 'SMTP server',
  summary:
    'Email through any mail server that takes SMTP: Google Workspace, Microsoft 365, your own.',
  category: 'email',
  countries: [],
  permission: 'integrations.manage',
  keys: z.object({
    host: field('Server', z.string().trim().toLowerCase().min(1).max(253)),
    port: field('Port', digits()).optional(),
    secure: toggle('TLS from the start (port 465)'),
    username: field('Username').optional(),
    password: secret('Password').optional(),
    fromEmail: address(),
    fromName: fromName(),
  }),
  client: (keys): MailClient => ({
    server: {
      ...SERVER,
      provider: 'smtp',
      smtpHost: keys.host,
      smtpPort: Number(keys.port ?? (keys.secure ? 465 : 587)),
      smtpSecure: keys.secure,
      username: keys.username ?? '',
    },
    secret: keys.password ?? '',
    from: { name: keys.fromName ?? null, address: keys.fromEmail },
    configurationSet: '',
  }),
  verify,
});

const amazonSes = defineIntegration({
  key: 'amazon-ses',
  name: 'Amazon SES',
  summary: 'Email through your AWS account’s Simple Email Service, from its verified domains.',
  category: 'email',
  countries: [],
  permission: 'integrations.manage',
  dashboard: 'https://console.aws.amazon.com/ses/home',
  keys: z.object({
    region: field(
      'Region',
      z
        .string()
        .trim()
        .regex(/^[a-z]{2}(-[a-z]+)+-\d$/, 'an AWS region, such as eu-west-1'),
    ),
    accessKeyId: field(
      'Access key ID',
      z
        .string()
        .trim()
        .regex(/^[A-Z0-9]{16,128}$/, 'an access key ID, such as AKIA…'),
    ),
    secretAccessKey: secret('Secret access key'),
    configurationSet: field('Configuration set').optional(),
    fromEmail: address(),
    fromName: fromName(),
  }),
  client: (keys): MailClient => ({
    server: { ...SERVER, provider: 'ses', username: keys.accessKeyId, region: keys.region },
    secret: keys.secretAccessKey,
    from: { name: keys.fromName ?? null, address: keys.fromEmail },
    configurationSet: keys.configurationSet ?? '',
  }),
  verify,
});

const sendgrid = defineIntegration({
  key: 'sendgrid',
  name: 'SendGrid',
  summary: 'Email through your SendGrid account, from its verified senders and domains.',
  category: 'email',
  countries: [],
  permission: 'integrations.manage',
  dashboard: 'https://app.sendgrid.com',
  keys: z.object({
    apiKey: secret(
      'API key',
      z
        .string()
        .trim()
        .regex(/^SG\.[\w-]+\.[\w-]+$/, 'a SendGrid API key: SG. and two parts'),
    ),
    fromEmail: address(),
    fromName: fromName(),
  }),
  client: (keys): MailClient => ({
    server: { ...SERVER, provider: 'sendgrid' },
    secret: keys.apiKey,
    from: { name: keys.fromName ?? null, address: keys.fromEmail },
    configurationSet: '',
  }),
  verify,
});

/** The integrations a Mail service connection is one of. */
export const MAIL_INTEGRATIONS: readonly KeyedIntegration<Keys, MailClient>[] = [
  smtp,
  amazonSes,
  sendgrid,
];

export const MAIL_KEYS: string[] = MAIL_INTEGRATIONS.map((integration) => integration.key);

/** The Mail service integration of a connection's key; undefined for any other. */
export const mailIntegrationOf = (key: string) =>
  MAIL_INTEGRATIONS.find((integration) => integration.key === key);
