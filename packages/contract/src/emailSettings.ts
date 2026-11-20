import { emailSettings } from '@erxes/core-db/schema';
import { oc } from '@orpc/contract';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { isoDate } from './common';
import { COMMON_ERRORS, ERRORS } from './errors';

export const EmailSettings = createSelectSchema(emailSettings, {
  failedAt: isoDate,
  createdAt: isoDate,
  updatedAt: isoDate,
}).pick({
  /** `smtp`: the organisation's own server; `sendgrid`, `ses`: through their SMTP. */
  provider: true,
  /** Shown with `fromEmail`; a broadcast's own sender name replaces it. */
  fromName: true,
  fromEmail: true,
  smtpHost: true,
  smtpPort: true,
  /** TLS from the start (port 465), rather than STARTTLS. */
  smtpSecure: true,
  /** `smtp`: its user name; `ses`: the access key id. */
  username: true,
  /** `ses`: the AWS region. */
  region: true,
  /** Since when its server refuses the login or can't be reached: "Needs attention". */
  failedAt: true,
  /** What the server said. */
  failure: true,
  createdAt: true,
  updatedAt: true,
});

export type EmailSettings = z.infer<typeof EmailSettings>;

const sender = {
  fromName: z.string().trim().max(100).optional(),
  fromEmail: z.string().trim().check(z.email()).max(254),
  /** The password, API key or secret access key. Left out on a change: the saved one stays. */
  secret: z.string().min(1).max(500).optional(),
};

/** One of the providers, with what it needs. */
export const EmailSettingsInput = z.discriminatedUnion('provider', [
  z.object({
    provider: z.literal('smtp'),
    ...sender,
    smtpHost: z
      .string()
      .trim()
      .toLowerCase()
      .regex(/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/, 'a host name'),
    smtpPort: z.int().min(1).max(65_535),
    smtpSecure: z.boolean(),
    /** Empty: the server takes mail without signing in. */
    username: z.string().trim().max(200),
  }),
  z.object({ provider: z.literal('sendgrid'), ...sender }),
  z.object({
    provider: z.literal('ses'),
    ...sender,
    region: z
      .string()
      .trim()
      .regex(/^[a-z]{2}(-[a-z]+)+-\d$/, 'an AWS region, e.g. us-east-1'),
    username: z
      .string()
      .trim()
      .regex(/^[A-Z0-9]{16,128}$/, 'an access key id'),
  }),
]);

export type EmailSettingsInput = z.infer<typeof EmailSettingsInput>;

const { INVALID_URL, MAIL_SERVER_REFUSED } = ERRORS;

const base = oc.errors({ ...COMMON_ERRORS, INVALID_URL, MAIL_SERVER_REFUSED });

/**
 * How the organisation sends its emails (Settings › Email sending,
 * `integrations.manage`): invitations, password resets,
 * notifications, automations and broadcasts all go out from its own address
 * through its SMTP server, SendGrid or Amazon SES. Without settings they go
 * through the server's (`EMAIL_SMTP_URL`). The secret is never sent back.
 */
export const emailSettingsContract = {
  settings: base
    .route({
      method: 'GET',
      path: '/email/settings',
      summary: 'How the organisation sends its emails; null: through the server’s',
    })
    .output(EmailSettings.nullable()),
  saveSettings: base
    .route({
      method: 'PUT',
      path: '/email/settings',
      summary:
        'Send the organisation’s emails this way, once its server takes the login. 400 INVALID_URL for an SMTP server core may not reach, MAIL_SERVER_REFUSED with what the server said, INVALID_INPUT without the secret the first time',
    })
    .input(EmailSettingsInput)
    .output(EmailSettings),
  defaultSending: base
    .route({
      method: 'GET',
      path: '/email/default',
      summary:
        'How the organisation’s emails go out without its own settings: the server’s From, or null when the server sends none',
    })
    .output(z.object({ from: z.string().nullable() })),
  removeSettings: base
    .route({
      method: 'DELETE',
      path: '/email/settings',
      summary: 'Send the organisation’s emails through the server’s again',
    })
    .output(z.object({ ok: z.literal(true) })),
  sendTest: base
    .route({
      method: 'POST',
      path: '/email/settings/test',
      summary: 'Send a test email with the saved settings, to me or to `to`, and say how it went',
    })
    .input(z.object({ to: z.string().trim().check(z.email()).max(254).optional() }))
    .output(
      z.object({
        ok: z.boolean(),
        /** What the server said when it refused, or why it couldn’t be reached. */
        error: z.string().nullable(),
      }),
    ),
};
