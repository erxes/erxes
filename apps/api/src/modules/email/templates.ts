import { z } from 'zod';

const Button = z.object({ label: z.string(), link: z.string() });

/** Emails core sends: the template and its data, as queued in an `email.send` job. */
export const EmailPayload = z.discriminatedUnion('template', [
  z.object({
    to: z.string(),
    template: z.literal('invitation'),
    data: z.object({
      organization: z.string(),
      inviter: z.string(),
      link: z.string(),
      days: z.number(),
    }),
  }),
  z.object({
    to: z.string(),
    template: z.literal('password_reset'),
    data: z.object({ organization: z.string(), link: z.string(), minutes: z.number() }),
  }),
  z.object({
    to: z.string(),
    template: z.literal('security_alert'),
    data: z.object({
      organization: z.string(),
      title: z.string(),
      body: z.string(),
      link: z.string(),
    }),
  }),
  z.object({
    to: z.string(),
    template: z.literal('notification'),
    data: z.object({
      organization: z.string(),
      title: z.string(),
      body: z.string().nullable(),
      link: z.string(),
    }),
  }),
  /** A customer's one-time sign-in code. */
  z.object({
    to: z.string(),
    template: z.literal('sign_in_code'),
    data: z.object({ organization: z.string(), code: z.string(), minutes: z.number() }),
  }),
  /** A plain message (automations, plugins): a subject and text. */
  z.object({
    to: z.string(),
    template: z.literal('message'),
    replyTo: z.string().optional(),
    data: z.object({ subject: z.string(), body: z.string(), button: Button.optional() }),
  }),
]);

export type EmailPayload = z.infer<typeof EmailPayload>;

interface EmailContent {
  subject: string;
  heading: string;
  lines: string[];
  button: z.infer<typeof Button> | null;
}

const contentOf = (email: EmailPayload): EmailContent => {
  switch (email.template) {
    case 'invitation': {
      const { data } = email;

      return {
        subject: `${data.inviter} invited you to ${data.organization} on erxes`,
        heading: `Join ${data.organization}`,
        lines: [
          `${data.inviter} invited you to work together in ${data.organization}.`,
          `The link works for ${data.days} days.`,
        ],
        button: { label: 'Accept the invitation', link: data.link },
      };
    }

    case 'password_reset': {
      const { data } = email;

      return {
        subject: `Reset your erxes password`,
        heading: 'Reset your password',
        lines: [
          `Someone asked to reset the password of your ${data.organization} account.`,
          `The link works once, for ${data.minutes} minutes. If it wasn't you, ignore this email: nothing changes.`,
        ],
        button: { label: 'Choose a new password', link: data.link },
      };
    }

    case 'security_alert': {
      const { data } = email;

      return {
        subject: `Security alert · ${data.organization}: ${data.title}`,
        heading: data.title,
        lines: [
          data.body,
          `This is a security notice from ${data.organization} on erxes; it can't be turned off.`,
        ],
        button: { label: 'Review in erxes', link: data.link },
      };
    }

    case 'notification': {
      const { data } = email;

      return {
        subject: data.title,
        heading: data.title,
        lines: [
          ...(data.body ? [data.body] : []),
          `${data.organization} on erxes · change what you get by email in Settings › Notifications.`,
        ],
        button: { label: 'Open in erxes', link: data.link },
      };
    }

    case 'sign_in_code': {
      const { data } = email;

      return {
        subject: `${data.code} is your ${data.organization} code`,
        heading: data.code,
        lines: [
          `Enter this code to sign in to ${data.organization}. It works once, for ${data.minutes} minutes.`,
          "If you didn't ask for it, ignore this email: nobody can sign in without the code.",
        ],
        button: null,
      };
    }

    case 'message': {
      const { data } = email;

      return {
        subject: data.subject,
        heading: data.subject,
        lines: data.body.split(/\n{2,}/),
        button: data.button ?? null,
      };
    }
  }
};

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

const escape = (value: string) => value.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char] ?? char);

/** Plain HTML (no remote images or scripts) and a text version. */
export const renderEmail = (email: EmailPayload) => {
  const content = contentOf(email);

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
