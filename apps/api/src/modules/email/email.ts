import { type Db, newId, organizations, withOrg } from '@erxes/core-db';
import { createTransport, type Transporter } from 'nodemailer';
import { z } from 'zod';
import { config } from '~/config';
import { logger } from '~/logger';
import { defineJob, describeError } from '~/modules/jobs/jobs';
import { AttachmentMissing, type FileAttachment, readAttachments } from './attachments';
import { type EmailOrigin, queueDeliveries, settleDelivery } from './deliveries';
import { decideAtSend } from './sendGate';
import { ownFrom, serverFrom } from './sender';
import { EmailPayload, type InlineImage, renderEmail } from './templates';
import { type DeliveryProvider, orgTransport, serverProvider } from './transport';

const log = logger.child({ component: 'email' });

let transporter: Transporter | null = null;

interface Message {
  to: string;
  cc?: string[];
  replyTo?: string;
  /** The sender's label: on SaaS it follows the organisation's name, self-hosted it is the name. */
  fromName?: string;
  subject: string;
  html: string;
  text: string;
  headers?: Record<string, string>;
  attachments?: InlineImage[];
  /** Stored files attached to the email (a broadcast's attachments). */
  files?: FileAttachment[];
  /** Its row in the delivery log: the provider's events come back tagged with it. */
  deliveryId: string;
}

/** Nodemailer's attachments: images the HTML shows by their content id, then the files. */
const attachmentsOf = (images: InlineImage[] | undefined, files: FileAttachment[] | undefined) => [
  ...(images ?? []).map(({ cid, filename, base64 }) => ({
    cid,
    filename,
    content: Buffer.from(base64, 'base64'),
    contentType: 'image/png',
    contentDisposition: 'inline' as const,
  })),
  ...(files ?? []),
];

/** Sent emails while `EMAIL_DRIVER=log` (development, tests). */
export const loggedEmails: Omit<Message, 'html' | 'deliveryId'>[] = [];

/** What an SMTP server answers when it refuses a message (nodemailer's error fields). */
class SmtpRefusal extends Error {
  constructor(
    message: string,
    readonly responseCode: number,
  ) {
    super(message);
  }
}

/**
 * The log driver refuses like a server would for the `.invalid` domains (RFC
 * 2606: never real): `bounce.invalid` has no such mailbox (550) and
 * `busy.invalid` asks to try later (421), so bounces and slow-downs can be
 * tried without a mail server.
 */
const logRefusal = (to: string) => {
  const domain = to.split('@')[1]?.toLowerCase();

  if (domain === 'bounce.invalid') throw new SmtpRefusal('550 5.1.1 No such user', 550);

  if (domain === 'busy.invalid') throw new SmtpRefusal('421 4.7.0 Try again later', 421);
};

/**
 * Headers that make the provider's events (`events/`) come back with the
 * organisation and the delivery row: SendGrid's unique args, SES's message
 * tags and the configuration set that publishes them. Another SMTP server
 * reports nothing.
 */
const tagHeaders = (
  provider: DeliveryProvider,
  tag: { orgId: string; deliveryId: string; configurationSet?: string },
): Record<string, string> => {
  if (provider === 'sendgrid') {
    return {
      'X-SMTPAPI': JSON.stringify({
        unique_args: { erxes_org: tag.orgId, erxes_delivery: tag.deliveryId },
      }),
    };
  }

  if (provider !== 'ses') return {};

  return {
    'X-SES-MESSAGE-TAGS': `erxes_org=${tag.orgId}, erxes_delivery=${tag.deliveryId}`,
    ...(tag.configurationSet ? { 'X-SES-CONFIGURATION-SET': tag.configurationSet } : {}),
  };
};

/** The log driver: kept for the tests, refusing `.invalid` addresses as a server would. */
const logEmail = ({ deliveryId: _delivery, ...message }: Message, fromName: string) => {
  logRefusal(message.to);
  loggedEmails.push({
    to: message.to,
    cc: message.cc,
    replyTo: message.replyTo,
    fromName,
    subject: message.subject,
    text: message.text,
    headers: message.headers,
    attachments: message.attachments,
    files: message.files,
  });

  if (loggedEmails.length > 100) loggedEmails.shift();
  log.info(
    { to: message.to, subject: message.subject, text: message.text },
    'email (not sent: EMAIL_DRIVER=log)',
  );
};

/**
 * How the organisation's emails go out now: its `provider` (for the delivery
 * log, known before a try fails) and `send`, which sends one email or throws
 * the server's refusal (nodemailer's `responseCode`). Self-hosted, an
 * organisation with its own settings (Settings › Integrations › Email sending)
 * sends from its address through its provider; the others, and every
 * organisation on SaaS, through the server's from `EMAIL_FROM`'s address under
 * the organisation's name (`sender.ts`).
 */
export const routeFor = async (orgId: string) => {
  const own = config.saas.enabled ? null : await orgTransport(orgId);

  if (own) {
    const { provider, configurationSet } = own.settings;

    return {
      provider: provider satisfies DeliveryProvider,
      send: async ({ fromName, attachments, files, deliveryId, headers, ...mail }: Message) => {
        await own.transport.sendMail({
          from: await ownFrom(orgId, own.settings, fromName),
          ...mail,
          headers: { ...headers, ...tagHeaders(provider, { orgId, deliveryId, configurationSet }) },
          attachments: attachmentsOf(attachments, files),
        });
      },
    };
  }

  const provider = serverProvider();

  return {
    provider,
    send: async (message: Message) => {
      const { fromName, attachments, files, deliveryId, headers, ...mail } = message;
      const from = await serverFrom(orgId, fromName);

      if (config.email.driver === 'log') return logEmail(message, from.name);

      if (!config.email.smtpUrl) throw new Error('EMAIL_SMTP_URL is not set');

      transporter ??= createTransport(config.email.smtpUrl);

      const tag = { orgId, deliveryId, configurationSet: config.email.events.sesConfigurationSet };

      await transporter.sendMail({
        from,
        ...mail,
        headers: { ...headers, ...tagHeaders(provider, tag) },
        attachments: attachmentsOf(attachments, files),
      });
    },
  };
};

/** A link into the scope's organisation (`withOrg`) in erxes: `APP_URL`, with its subdomain. */
export const appLink = async (client: Db, path: string) => {
  const [organization] = await client
    .select({ subdomain: organizations.subdomain })
    .from(organizations)
    .limit(1);

  return `${config.app.url.replace('{subdomain}', organization?.subdomain ?? '')}${path}`;
};

/** A queued email and its row in the delivery log. */
const EmailJobPayload = EmailPayload.and(z.object({ deliveryId: z.string() }));

/** The log row of a try; the email went already when it fails, so it is logged, not retried. */
const settle = async (...args: Parameters<typeof settleDelivery>) => {
  try {
    await settleDelivery(...args);
  } catch (error) {
    log.error({ err: error, orgId: args[0], deliveryId: args[1] }, 'email delivery not logged');
  }
};

export const emailJob = defineJob({
  queue: 'email.send',
  timeoutSeconds: 60,
  retry: { attempts: 6 },
  concurrency: 5,
  payload: EmailJobPayload,
  async handle(job) {
    const { payload } = job;

    // Suppressed since it was queued, held by the ramp, or let through now.
    const go = await withOrg(job.orgId, async (tx) => {
      const decision = await decideAtSend(tx, payload.deliveryId);

      if (!decision.send && decision.until)
        await emailJob.enqueue(tx, { orgId: job.orgId, payload, runAt: decision.until });

      return decision.send;
    });

    if (!go) return;

    const rendered = payload.template === 'rendered';
    const sent = payload.template === 'message' || rendered ? payload : null;
    // Unknown when the route itself can't be found (the settings, the server's address).
    let provider: DeliveryProvider | null = null;

    try {
      const route = await routeFor(job.orgId);

      provider = route.provider;
      await route.send({
        to: payload.to,
        cc: payload.template === 'message' ? payload.cc : undefined,
        replyTo: sent?.replyTo,
        fromName: sent?.fromName,
        attachments: rendered ? payload.attachments : undefined,
        files: rendered ? await readAttachments(job.orgId, payload.fileIds ?? []) : undefined,
        deliveryId: payload.deliveryId,
        ...renderEmail(payload),
      });
    } catch (error) {
      const missing = error instanceof AttachmentMissing;

      await settle(job.orgId, payload.deliveryId, {
        sent: false,
        provider,
        error: describeError(error),
        final: job.lastAttempt || missing,
      });

      if (missing) return;

      throw error;
    }

    await settle(job.orgId, payload.deliveryId, { sent: true, provider });
  },
});

/** An email to queue; `customerId` when it goes to a customer (their timeline shows it). */
type Outgoing = EmailPayload & { customerId?: string | null };

/**
 * Queues emails in the caller's transaction (rolled back = never sent), each
 * with its row in the delivery log; the `email.send` job delivers them,
 * retrying when the server refuses. A suppressed address's is held back
 * (`queueDeliveries`), as is a sign-in email past the hourly cap; callers
 * answer as if it was sent, so a reset form never tells either. One the
 * sending ramp holds waits in its job until the ramp's next window (`held`).
 * `suppressed` counts both kinds not sent.
 */
export const sendEmail = async (
  client: Db,
  orgId: string,
  email: Outgoing | Outgoing[],
  origin: EmailOrigin,
) => {
  const emails = (Array.isArray(email) ? email : [email]).map(({ customerId, ...payload }) => ({
    id: newId(),
    customerId,
    payload,
  }));

  const holds = await queueDeliveries(
    client,
    origin,
    emails.map(({ id, customerId, payload }) => ({
      id,
      customerId,
      to: payload.to,
      subject: renderEmail(payload).subject,
    })),
  );

  const untilOf = (id: string) => {
    const hold = holds.get(id);

    return hold?.status === 'held' ? hold.until : undefined;
  };

  const jobs = emails.filter(({ id }) => !holds.has(id) || untilOf(id));

  await emailJob.enqueueAll(
    client,
    jobs.map(({ id, payload }) => ({
      orgId,
      payload: { ...payload, deliveryId: id },
      runAt: untilOf(id),
    })),
  );

  const held = jobs.filter(({ id }) => untilOf(id)).length;

  return {
    queued: jobs.length - held,
    held,
    suppressed: emails.length - jobs.length,
  };
};
