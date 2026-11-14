import { type Db, organizations } from '@erxes/core-db';
import { createTransport, type Transporter } from 'nodemailer';
import { config } from '~/config';
import { logger } from '~/logger';
import { defineJob } from '~/modules/jobs/jobs';
import { EmailPayload, renderEmail } from './templates';

const log = logger.child({ component: 'email' });

let transporter: Transporter | null = null;

interface Message {
  to: string;
  replyTo?: string;
  subject: string;
  html: string;
  text: string;
}

/** Sent emails while `EMAIL_DRIVER=log` (development, tests). */
export const loggedEmails: Omit<Message, 'html'>[] = [];

const deliver = async (message: Message) => {
  if (config.email.driver === 'log') {
    loggedEmails.push({
      to: message.to,
      replyTo: message.replyTo,
      subject: message.subject,
      text: message.text,
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
  await transporter.sendMail({ from: config.email.from, ...message });
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

    await deliver({
      to: payload.to,
      replyTo: payload.template === 'message' ? payload.replyTo : undefined,
      ...renderEmail(payload),
    });
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
