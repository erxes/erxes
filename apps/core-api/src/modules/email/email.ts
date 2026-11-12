import { type Db, organizations } from '@erxes/core-db';
import { eq } from 'drizzle-orm';
import nodemailer, { type Transporter } from 'nodemailer';
import { config } from '~/config';
import { logger } from '~/logger';
import { enqueueJob, type JobDefinition } from '~/modules/jobs/jobs';

const log = logger.child({ component: 'email' });

/** Emails core sends, each a function of its data. */
export const TEMPLATES = {
  invitation: (data: { organization: string; inviter: string; link: string; days: number }) => ({
    subject: `${data.inviter} invited you to ${data.organization} on erxes`,
    heading: `Join ${data.organization}`,
    lines: [
      `${data.inviter} invited you to work together in ${data.organization}.`,
      `The link works for ${data.days} days.`,
    ],
    button: { label: 'Accept the invitation', link: data.link },
  }),
  password_reset: (data: { organization: string; link: string; minutes: number }) => ({
    subject: `Reset your erxes password`,
    heading: 'Reset your password',
    lines: [
      `Someone asked to reset the password of your ${data.organization} account.`,
      `The link works once, for ${data.minutes} minutes. If it wasn't you, ignore this email: nothing changes.`,
    ],
    button: { label: 'Choose a new password', link: data.link },
  }),
  security_alert: (data: { organization: string; title: string; body: string; link: string }) => ({
    subject: `Security alert · ${data.organization}: ${data.title}`,
    heading: data.title,
    lines: [
      data.body,
      `This is a security notice from ${data.organization} on erxes; it can't be turned off.`,
    ],
    button: { label: 'Review in erxes', link: data.link },
  }),
  notification: (data: {
    organization: string;
    title: string;
    body: string | null;
    link: string;
  }) => ({
    subject: data.title,
    heading: data.title,
    lines: [
      ...(data.body ? [data.body] : []),
      `${data.organization} on erxes · change what you get by email in Settings › Notifications.`,
    ],
    button: { label: 'Open in erxes', link: data.link },
  }),
  /** A plain message (automations): a subject and text. */
  message: (data: { subject: string; body: string; button?: { label: string; link: string } }) => ({
    subject: data.subject,
    heading: data.subject,
    lines: data.body.split(/\n{2,}/),
    button: data.button ?? null,
  }),
} as const;

export type EmailTemplate = keyof typeof TEMPLATES;

const escape = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!,
  );

/** Plain HTML (no remote images or scripts) and a text version. */
export const renderEmail = <T extends EmailTemplate>(
  template: T,
  data: Parameters<(typeof TEMPLATES)[T]>[0],
) => {
  const content = (
    TEMPLATES[template] as (input: typeof data) => ReturnType<(typeof TEMPLATES)[T]>
  )(data);

  const html = `<!doctype html><html><body style="margin:0;padding:24px;background:#f6f7f9;font-family:-apple-system,Segoe UI,Roboto,sans-serif;color:#111">
<table role="presentation" width="100%" style="max-width:520px;margin:0 auto;background:#fff;border-radius:12px;padding:32px">
<tr><td><h1 style="font-size:20px;margin:0 0 16px">${escape(content.heading)}</h1>
${content.lines.map((line) => `<p style="font-size:14px;line-height:1.6;margin:0 0 12px">${escape(line)}</p>`).join('\n')}
${
  content.button
    ? `<p style="margin:24px 0"><a href="${escape(content.button.link)}" style="display:inline-block;background:#5629b6;color:#fff;text-decoration:none;padding:10px 18px;border-radius:8px;font-size:14px">${escape(content.button.label)}</a></p>
<p style="font-size:12px;color:#666;word-break:break-all">${escape(content.button.link)}</p>`
    : ''
}
</td></tr></table></body></html>`;

  const text = [
    content.heading,
    '',
    ...content.lines,
    ...(content.button ? ['', `${content.button.label}: ${content.button.link}`] : []),
  ].join('\n');

  return { subject: content.subject, html, text };
};

let transporter: Transporter | null = null;

/** Sent emails while `EMAIL_DRIVER=log` (development, tests). */
export const loggedEmails: { to: string; subject: string; text: string }[] = [];

const deliver = async (message: { to: string; subject: string; html: string; text: string }) => {
  if (config.email.driver === 'log') {
    loggedEmails.push({ to: message.to, subject: message.subject, text: message.text });

    if (loggedEmails.length > 100) loggedEmails.shift();
    log.info(
      {
        to: message.to,
        subject: message.subject,
        text: message.text,
      },
      'email (not sent: EMAIL_DRIVER=log)',
    );

    return;
  }

  if (!config.email.smtpUrl) throw new Error('EMAIL_SMTP_URL is not set');

  transporter ??= nodemailer.createTransport(config.email.smtpUrl);
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

/**
 * Queues an email in the caller's transaction (rolled back = never sent);
 * the `email.send` job delivers it, retrying when the server refuses.
 */
export const sendEmail = <T extends EmailTemplate>(
  client: Db,
  orgId: string,
  input: { to: string; template: T; data: Parameters<(typeof TEMPLATES)[T]>[0] },
) =>
  enqueueJob(client, {
    orgId,
    queue: 'email.send',
    payload: { to: input.to, template: input.template, data: input.data },
    maxAttempts: 6,
  });

export const emailJob: JobDefinition = {
  queue: 'email.send',
  leaseSeconds: 60,
  async handle(job) {
    const { to, template, data } = job.payload as {
      to: string;
      template: EmailTemplate;
      data: never;
    };

    await deliver({ to, ...renderEmail(template, data) });
  },
  async onDead(job, error) {
    log.error(
      { job: job.id, template: job.payload.template, err: error },
      'email could not be sent',
    );
  },
};
