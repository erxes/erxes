import { emailSettings, withOrg } from '@erxes/core-db';
import { isNotNull, isNull, sql } from 'drizzle-orm';
import { createTransport, type Transporter } from 'nodemailer';
import { config } from '~/config';
import { hmacSha256Bytes } from '~/lib/crypto';
import { OutboundError, publicAddressOf } from '~/lib/outbound';
import { unseal } from '~/lib/secrets';
import { enqueueJob } from '~/modules/jobs/jobs';

export type EmailSettingsRow = typeof emailSettings.$inferSelect;

/** What signing in to a server needs: the saved settings, or those about to be saved. */
export type ServerSettings = Pick<
  EmailSettingsRow,
  'provider' | 'smtpHost' | 'smtpPort' | 'smtpSecure' | 'username' | 'region' | 'secretSealed'
>;

/** Amazon SES's SMTP password for an IAM secret access key (AWS's published derivation, version 4). */
export const sesSmtpPassword = (secretAccessKey: string, region: string) => {
  const signature = [region, 'ses', 'aws4_request', 'SendRawEmail'].reduce(
    (key, part) => hmacSha256Bytes(key, part),
    hmacSha256Bytes(`AWS4${secretAccessKey}`, '11111111'),
  );

  return Buffer.concat([Buffer.from([0x04]), signature]).toString('base64');
};

/** The SMTP server of the settings and how to sign in to it: SendGrid and SES take SMTP too. */
const serverOf = (settings: ServerSettings) => {
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
const transportFor = async (settings: ServerSettings) => {
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

/** Signs in to the server and leaves: what it said when it refused, or null. */
export const loginRefusal = async (settings: ServerSettings) => {
  let transport: Transporter | undefined;

  try {
    transport = await transportFor(settings);
    await transport.verify();

    return null;
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  } finally {
    transport?.close();
  }
};

/** nodemailer's codes for a server that refused the login or couldn't be reached. */
const SERVER_FAILURES = new Set(['EAUTH', 'ECONNECTION', 'ETIMEDOUT', 'ESOCKET', 'EDNS', 'ETLS']);

/** The settings need fixing, not the email: the login was refused or the server can't be reached. */
export const isSettingsFailure = (error: unknown): error is Error =>
  error instanceof OutboundError ||
  (error instanceof Error &&
    'code' in error &&
    typeof error.code === 'string' &&
    SERVER_FAILURES.has(error.code));

/** The queue that tells the owners their emails stopped (`emailFailingJob`). */
export const EMAIL_FAILING_QUEUE = 'email.failing';

/** Its server stopped taking the organisation's emails; the first failure tells the owners. */
export const markFailing = (orgId: string, failure: string) =>
  withOrg(orgId, async (tx) => {
    const [first] = await tx
      .update(emailSettings)
      .set({ failedAt: sql`now()`, failure })
      .where(isNull(emailSettings.failedAt))
      .returning({ orgId: emailSettings.orgId });

    if (first) await enqueueJob(tx, { orgId, queue: EMAIL_FAILING_QUEUE, payload: { failure } });
  });

/** Its server took an email again. */
export const markWorking = (orgId: string) =>
  withOrg(orgId, (tx) =>
    tx
      .update(emailSettings)
      .set({ failedAt: null, failure: null })
      .where(isNotNull(emailSettings.failedAt)),
  );
