import { emailSettings, withOrg } from '@erxes/core-db';
import type { EMAIL_DELIVERY_PROVIDERS } from '@erxes/core-db/emailEnums';
import { createTransport, type Transporter } from 'nodemailer';
import { config } from '~/config';
import { hmacSha256Bytes } from '~/lib/crypto';
import { publicAddressOf } from '~/lib/outbound';
import { unseal } from '~/lib/secrets';

export type EmailSettingsRow = typeof emailSettings.$inferSelect;

export type DeliveryProvider = (typeof EMAIL_DELIVERY_PROVIDERS)[number];

/** What the server's `EMAIL_SMTP_URL` is, by its host: SendGrid's, SES's, or another SMTP server. */
export const serverProvider = (): DeliveryProvider => {
  if (config.email.driver === 'log') return 'log';

  const host = URL.parse(config.email.smtpUrl ?? '')?.hostname ?? '';

  if (host === 'smtp.sendgrid.net') return 'sendgrid';

  return /^email-smtp\.[a-z0-9-]+\.amazonaws\.com$/.test(host) ? 'ses' : 'smtp';
};

/** Amazon SES's SMTP password for an IAM secret access key (AWS's published derivation, version 4). */
export const sesSmtpPassword = (secretAccessKey: string, region: string) => {
  const signature = [region, 'ses', 'aws4_request', 'SendRawEmail'].reduce(
    (key, part) => hmacSha256Bytes(key, part),
    hmacSha256Bytes(`AWS4${secretAccessKey}`, '11111111'),
  );

  return Buffer.concat([Buffer.from([0x04]), signature]).toString('base64');
};

/** The SMTP server of the settings and how to sign in to it: SendGrid and SES take SMTP too. */
const serverOf = (settings: EmailSettingsRow) => {
  const secret = unseal(settings.secretSealed);

  if (settings.provider === 'sendgrid') {
    return {
      host: 'smtp.sendgrid.net',
      port: 587,
      secure: false,
      auth: { user: 'apikey', pass: secret },
    };
  }

  if (settings.provider === 'ses') {
    return {
      host: `email-smtp.${settings.region}.amazonaws.com`,
      port: 587,
      secure: false,
      auth: { user: settings.username, pass: sesSmtpPassword(secret, settings.region) },
    };
  }

  return {
    host: settings.smtpHost,
    port: settings.smtpPort,
    secure: settings.smtpSecure,
    auth: settings.username ? { user: settings.username, pass: secret } : undefined,
  };
};

/**
 * A transport to the settings' server, connected to its public address (never
 * a private one, see `publicAddressOf`) with TLS checked against its name.
 * Mail goes out encrypted, except to a development server.
 */
const transportFor = async (settings: EmailSettingsRow) => {
  const { host, ...server } = serverOf(settings);

  return createTransport({
    ...server,
    host: await publicAddressOf(host),
    requireTLS: !server.secure && !config.outbound.allowPrivate,
    tls: { servername: host },
    connectionTimeout: 15_000,
    greetingTimeout: 15_000,
    socketTimeout: 30_000,
  });
};

/** A transport stays for 10 minutes, or until the settings change, then the address is looked up again. */
const KEEP_MS = 10 * 60_000;

const kept = new Map<string, { version: string; until: number; transport: Transporter }>();

/** The organisation's settings and a transport for them; null: it sends through the server's. */
export const orgTransport = async (orgId: string) => {
  const [settings] = await withOrg(orgId, (tx) => tx.select().from(emailSettings).limit(1));

  if (!settings) return null;

  const version = settings.updatedAt.toISOString();
  const cached = kept.get(orgId);

  if (cached?.version === version && cached.until > Date.now()) {
    return { settings, transport: cached.transport };
  }

  cached?.transport.close();

  const transport = await transportFor(settings);

  kept.set(orgId, { version, until: Date.now() + KEEP_MS, transport });

  return { settings, transport };
};
