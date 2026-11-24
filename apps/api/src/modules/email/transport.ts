import { type Db, emailSettings, secrets, withOrg } from '@erxes/core-db';
import type { EMAIL_DELIVERY_PROVIDERS } from '@erxes/core-db/emailEnums';
import { eq } from 'drizzle-orm';
import { createTransport, type Transporter } from 'nodemailer';
import { config } from '~/config';
import { hmacSha256Bytes } from '~/lib/crypto';
import { publicAddressOf } from '~/lib/outbound';
import { openSecret } from '~/modules/secrets/vault';

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

/**
 * A server erxes sends through: Organization email's own settings, or a Mail service
 * connection (`integrations/mail.ts`). The secret is the password, SendGrid's API key or the
 * IAM secret access key SES's SMTP password comes from.
 */
export type MailServer = Pick<
  EmailSettingsRow,
  'provider' | 'smtpHost' | 'smtpPort' | 'smtpSecure' | 'username' | 'region'
>;

/** The SMTP server and how to sign in to it: SendGrid and SES take SMTP too. */
const serverOf = (settings: MailServer, secret: string) => {
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
export const transportFor = async (settings: MailServer, secret: string) => {
  const { host, ...server } = serverOf(settings, secret);

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

/**
 * The transport kept under `key` (the organisation's settings, or a connection) while its
 * `version` (when it was last changed) stays, else a new one to `server`.
 */
export const keptTransport = async (
  key: string,
  version: string,
  server: MailServer,
  secret: string,
) => {
  const cached = kept.get(key);

  if (cached?.version === version && cached.until > Date.now()) return cached.transport;

  cached?.transport.close();

  const transport = await transportFor(server, secret);

  kept.set(key, { version, until: Date.now() + KEEP_MS, transport });

  return transport;
};

/** The organisation's own settings and their sealed secret; null: it sends through the server's. */
export const ownSettingsAndSecret = async (client: Db) => {
  const [found] = await client
    .select({ settings: emailSettings, secret: secrets })
    .from(emailSettings)
    .innerJoin(secrets, eq(secrets.id, emailSettings.secretId))
    .limit(1);

  return found ?? null;
};

/** The organisation's settings and a transport for them; null: it sends through the server's. */
export const orgTransport = async (orgId: string) => {
  const found = await withOrg(orgId, ownSettingsAndSecret);

  if (!found) return null;

  const { settings } = found;

  const transport = await keptTransport(
    `org:${orgId}`,
    settings.updatedAt.toISOString(),
    settings,
    openSecret(found.secret),
  );

  return { settings, transport };
};
