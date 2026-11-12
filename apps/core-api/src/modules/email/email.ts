import { type Db, organizations } from '@erxes/core-db';
import { eq } from 'drizzle-orm';
import { createTransport, type Transporter } from 'nodemailer';
import { config } from '~/config';
import { logger } from '~/logger';
import { defineJob } from '~/modules/jobs/jobs';
import { EmailPayload, renderEmail } from './templates';

const log = logger.child({ component: 'email' });

let transporter: Transporter | null = null;

/** Sent emails while `EMAIL_DRIVER=log` (development, tests). */
export const loggedEmails: { to: string; subject: string; text: string }[] = [];

const deliver = async (message: { to: string; subject: string; html: string; text: string }) => {
  if (config.email.driver === 'log') {
    loggedEmails.push({ to: message.to, subject: message.subject, text: message.text });

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

/** A link into the organisation's erxes (`APP_URL`, with its subdomain). */
export const appLink = async (client: Db, orgId: string, path: string) => {
  const [organization] = await client
    .select({ subdomain: organizations.subdomain })
    .from(organizations)
    .where(eq(organizations.id, orgId))
    .limit(1);

  return `${config.app.url.replace('{subdomain}', organization?.subdomain ?? '')}${path}`;
};

export const emailJob = defineJob({
  queue: 'email.send',
  leaseSeconds: 60,
  payload: EmailPayload,
  async handle(job) {
    await deliver({ to: job.payload.to, ...renderEmail(job.payload) });
  },
  async onDead(job, error) {
    log.error(
      { job: job.id, template: job.payload.template, err: error },
      'email could not be sent',
    );
  },
});

/**
 * Queues an email in the caller's transaction (rolled back = never sent);
 * the `email.send` job delivers it, retrying when the server refuses.
 */
export const sendEmail = (client: Db, orgId: string, email: EmailPayload) =>
  emailJob.enqueue(client, { orgId, payload: email, maxAttempts: 6 });
