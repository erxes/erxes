import { type Db, organizations, withOrg } from '@erxes/core-db';
import { createTransport, type Transporter } from 'nodemailer';
import { config } from '~/config';
import { logger } from '~/logger';
import { defineJob } from '~/modules/jobs/jobs';
import { addressing, confirmedSender, parseFrom, type Sender } from './addressing';
import { EmailPayload, type InlineImage, renderEmail } from './templates';
import { orgTransport } from './transport';

const log = logger.child({ component: 'email' });

let transporter: Transporter | null = null;

interface Message {
  to: string;
  replyTo?: string;
  /** The sender's name, shown with the sending address (the organisation's, else `EMAIL_FROM`). */
  fromName?: string;
  /** A confirmed sender it goes out as (see `addressing`). */
  sender?: Sender | null;
  subject: string;
  html: string;
  text: string;
  headers?: Record<string, string>;
  attachments?: InlineImage[];
}

/** Nodemailer's attachment for an image the HTML shows by its content id. */
const inlineImages = (images: InlineImage[] | undefined) =>
  images?.map(({ cid, filename, base64 }) => ({
    cid,
    filename,
    content: Buffer.from(base64, 'base64'),
    contentType: 'image/png',
    contentDisposition: 'inline' as const,
  }));

/** An email as it went out: its From and Reply-To worked out, without the HTML. */
type Sent = Omit<Message, 'html' | 'fromName' | 'sender'> & { from: string };

/** Sent emails while `EMAIL_DRIVER=log` (development, tests). */
export const loggedEmails: Sent[] = [];

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

const shownFrom = (from: ReturnType<typeof addressing>['from']) =>
  typeof from === 'string' ? from : `${from.name} <${from.address}>`;

/**
 * Sends one email now, or throws the server's refusal (nodemailer's
 * `responseCode`). An organisation with its own settings (Settings ›
 * Email sending) sends from its address through its provider; the others
 * through the server's.
 */
export const deliverEmail = async (message: Message, orgId?: string) => {
  const own = orgId ? await orgTransport(orgId) : null;
  const { fromName, sender, attachments, ...mail } = message;

  const sending = own
    ? { name: own.settings.fromName, address: own.settings.fromEmail }
    : parseFrom(config.email.from);

  const { from, replyTo } = addressing(sending, { fromName, replyTo: mail.replyTo, sender });
  const outgoing = { ...mail, from, replyTo, attachments: inlineImages(attachments) };

  if (own) {
    await own.transport.sendMail(outgoing);

    return;
  }

  if (config.email.driver === 'log') {
    logRefusal(message.to);
    loggedEmails.push({ ...mail, from: shownFrom(from), replyTo, attachments });

    if (loggedEmails.length > 100) loggedEmails.shift();
    log.info(
      { to: message.to, subject: message.subject, text: message.text },
      'email (not sent: EMAIL_DRIVER=log)',
    );

    return;
  }

  if (!config.email.smtpUrl) throw new Error('EMAIL_SMTP_URL is not set');

  transporter ??= createTransport(config.email.smtpUrl);

  await transporter.sendMail(outgoing);
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
    const { payload, orgId } = job;

    const rendered = payload.template === 'rendered';
    const own = payload.template === 'message' || rendered ? payload : null;

    // Read when it goes out: a sender removed since sends from the sending address.
    const fromEmail = own?.fromEmail;

    const sender =
      fromEmail && orgId ? await withOrg(orgId, (tx) => confirmedSender(tx, fromEmail)) : null;

    await deliverEmail(
      {
        to: payload.to,
        replyTo: own?.replyTo,
        fromName: rendered ? payload.fromName : undefined,
        sender,
        attachments: rendered ? payload.attachments : undefined,
        ...renderEmail(payload),
      },
      orgId,
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
