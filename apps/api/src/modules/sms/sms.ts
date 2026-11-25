import { type Db, integrationConnections, withOrg } from '@erxes/core-db';
import { and, asc, eq, inArray, sql } from 'drizzle-orm';
import { z } from 'zod';
import { config } from '~/config';
import { logger } from '~/logger';
import { clientOf, connectionsWithSecret } from '~/modules/integrations/connections';
import { keyedOf, SMS_KEYS } from '~/modules/integrations/registry';
import { defineJob } from '~/modules/jobs/jobs';

const log = logger.child({ component: 'sms' });

const SmsPayload = z.object({
  to: z.string(),
  text: z.string(),
  /** The SMS connection to text through (a portal's); while it isn't active, the oldest. */
  connectionId: z.string().optional(),
});

type SmsPayload = z.infer<typeof SmsPayload>;

/** Texts written to the log while the organisation has no SMS connection (development, tests). */
export const loggedSms: SmsPayload[] = [];

/**
 * The organisation's SMS connection (CallPro, Twilio in Settings › Integrations): `preferred`
 * while it is active, else its oldest active one of an integration that sends texts.
 */
const smsConnection = (tx: Db, preferred?: string | null) =>
  connectionsWithSecret(
    tx,
    and(inArray(integrationConnections.key, SMS_KEYS), eq(integrationConnections.status, 'active')),
  )
    .orderBy(
      sql`${integrationConnections.id} = ${preferred ?? ''} desc`,
      asc(integrationConnections.createdAt),
    )
    .limit(1)
    .then(([row]) => row);

/**
 * Whether the organisation's texts reach phones: it has an SMS connection, or this isn't
 * production (texts go to the log there).
 */
export const canDeliverSms = async (tx: Db, preferred?: string | null) =>
  !config.isProduction || Boolean(await smsConnection(tx, preferred));

const logText = (message: SmsPayload) => {
  loggedSms.push(message);

  if (loggedSms.length > 100) loggedSms.shift();

  log.info(message, 'sms (not sent: no SMS connection)');
};

/**
 * Sends one text for the organisation now, through its SMS connection, or throws. The
 * connection is read in a short scope and the provider is called after it. With no connection
 * outside production the text goes to the log.
 */
export const deliverSms = async (orgId: string, message: SmsPayload) => {
  const opened = await withOrg(orgId, async (tx) => {
    const row = await smsConnection(tx, message.connectionId);

    if (!row) return null;

    const integration = keyedOf(row.key);

    return { integration, client: await clientOf(tx, integration, row) };
  });

  if (!opened) {
    // Texts hold sign-in codes: production never logs them, and never says it sent them.
    if (config.isProduction) throw new Error('the organisation has no SMS connection');

    logText(message);

    return;
  }

  if (!opened.integration.smsSending) throw new Error(`${opened.integration.key} sends no texts`);

  await opened.integration.smsSending.send(opened.client, message);
};

export const smsJob = defineJob({
  queue: 'sms.send',
  timeoutSeconds: 60,
  retry: { attempts: 4 },
  payload: SmsPayload,
  async handle(job) {
    await deliverSms(job.orgId, job.payload);
  },
});

/** Queues text messages in the caller's transaction; the `sms.send` job delivers each. */
export const sendSms = (client: Db, orgId: string, message: SmsPayload | SmsPayload[]) =>
  smsJob.enqueueAll(
    client,
    (Array.isArray(message) ? message : [message]).map((payload) => ({ orgId, payload })),
  );
