import { type Db, organizations } from '@erxes/core-db';
import { createTransport, type Transporter } from 'nodemailer';
import { config } from '~/config';
import { logger } from '~/logger';
import { defineJob } from '~/modules/jobs/jobs';
import { EmailPayload, renderEmail } from './templates';
import { orgTransport } from './transport';

const log = logger.child({ component: 'email' });

let transporter: Transporter | null = null;

interface Message {
  to: string;
  replyTo?: string;
  /** The sender's name, shown with the sending address (the organisation's, else `EMAIL_FROM`). */
  fromName?: string;
  subject: string;
  html: string;
  text: string;
  headers?: Record<string, string>;
}

/** Sent emails while `EMAIL_DRIVER=log` (development, tests). */
export const loggedEmails: Omit<Message, 'html'>[] = [];

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

/** `EMAIL_FROM`'s address under another name. */
const fromWith = (name: string | undefined) => {
  if (!name) return config.email.from;

  const address = /<([^>]+)>/.exec(config.email.from)?.[1] ?? config.email.from;

  return { name, address };
};

/**
 * Sends one email now, or throws the server's refusal (nodemailer's
 * `responseCode`). An organisation with its own settings (Settings ›
 * Integrations › Email sending) sends from its address through its provider;
 * the others through the server's.
 */
export const deliverEmail = async (message: Message, orgId?: string) => {
  const own = orgId ? await orgTransport(orgId) : null;

  if (own) {
    const { fromName, ...mail } = message;
    const name = fromName ?? own.settings.fromName;

    await own.transport.sendMail({
      from: name ? { name, address: own.settings.fromEmail } : own.settings.fromEmail,
      ...mail,
    });

    return;
  }

  if (config.email.driver === 'log') {
    logRefusal(message.to);
    loggedEmails.push({
      to: message.to,
      replyTo: message.replyTo,
      fromName: message.fromName,
      subject: message.subject,
      text: message.text,
      headers: message.headers,
    });

    if (loggedEmails.length > 100) loggedEmails.shift();
    log.info(
      { to: message.to, subject: message.subject, text: message.text },
      'email (not sent: EMAIL_DRIVER=log)',
    );

    return;
  }

  if (!config.email.smtpUrl) throw new Error('EMAIL_SMTP_URL is not set');

  transporter ??= createTransport(config.email.smtpUrl);

  const { fromName, ...mail } = message;

  await transporter.sendMail({ from: fromWith(fromName), ...mail });
};

/** A link into the scope's organisation (`withOrg`) in erxes: `APP_URL`, with its subdomain. */
export const appLink = async (client: Db, path: string) => {
  const [organization] = await client
    .select({ subdomain: organizations.subdomain })
    .from(organizations)
    .limit(1);

  return `${config.app.url.replace('{subdomain}', organization?.subdomain ?? '')}${path}`;
};

export const emailJob = defineJob({
  queue: 'email.send',
  timeoutSeconds: 60,
  retry: { attempts: 6 },
  concurrency: 5,
  payload: EmailPayload,
  async handle(job) {
    const { payload } = job;

    const rendered = payload.template === 'rendered';

    await deliverEmail(
      {
        to: payload.to,
        replyTo: payload.template === 'message' || rendered ? payload.replyTo : undefined,
        fromName: rendered ? payload.fromName : undefined,
        ...renderEmail(payload),
      },
      job.orgId,
    );
  },
});

/**
 * Queues an email in the caller's transaction (rolled back = never sent);
 * the `email.send` job delivers it, retrying when the server refuses.
 */
export const sendEmail = (client: Db, orgId: string, email: EmailPayload | EmailPayload[]) =>
  emailJob.enqueueAll(
    client,
    (Array.isArray(email) ? email : [email]).map((payload) => ({ orgId, payload })),
  );
