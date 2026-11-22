import { emailSettings } from '@erxes/core-db/schema';
import { oc } from '@orpc/contract';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { isoDate } from './common';
import { COMMON_ERRORS, ERRORS } from './errors';

export const EmailSettings = createSelectSchema(emailSettings, {
  createdAt: isoDate,
  updatedAt: isoDate,
})
  .pick({
    /** `smtp`: the organisation's own server; `sendgrid`, `ses`: through their SMTP. */
    provider: true,
    /** Shown with `fromEmail`; a broadcast's or automation's own name replaces it. */
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
    /** `sendgrid`: the Signed Event Webhook's verification key; empty: its events aren't taken. */
    eventsKey: true,
    /** `ses`: the configuration set every email names; its event destination is `eventsTopicArn`. */
    configurationSet: true,
    /** `ses`: the SNS topic events come through; empty: they aren't taken. */
    eventsTopicArn: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    /** Where the provider posts its events (bounces, complaints, deliveries); null for `smtp`. */
    eventsUrl: z.string().nullable(),
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
  z.object({
    provider: z.literal('sendgrid'),
    ...sender,
    /** The Signed Event Webhook's verification key (base64), from SendGrid's Mail Settings. */
    eventsKey: z
      .string()
      .trim()
      .regex(/^[A-Za-z0-9+/=\s]{0,500}$/, 'a base64 key')
      .default(''),
  }),
  z.object({
    provider: z.literal('ses'),
    ...sender,
    configurationSet: z
      .string()
      .trim()
      .regex(/^[A-Za-z0-9_-]{0,64}$/, 'a configuration set name')
      .default(''),
    eventsTopicArn: z
      .string()
      .trim()
      .regex(/^(arn:aws[a-z-]*:sns:[a-z0-9-]+:\d{12}:[A-Za-z0-9_-]{1,256})?$/, 'an SNS topic ARN')
      .default(''),
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

const { INVALID_URL } = ERRORS;

const base = oc.errors({ ...COMMON_ERRORS, INVALID_URL });

/**
 * How the organisation sends its emails (Settings › Integrations › Email
 * sending, `integrations.manage`): invitations, password resets,
 * notifications, automations and broadcasts all go out from its own address
 * through its SMTP server, SendGrid or Amazon SES. Without settings they go
 * through the server's (`EMAIL_SMTP_URL`). The secret is never sent back.
 * SendGrid and SES report bounces and complaints to `eventsUrl`, checked with
 * `eventsKey` or `eventsTopicArn`. Self-hosted only: on SaaS every organisation sends through the server's,
 * and saving or testing answers 402 NOT_IN_PLAN.
 */
export const emailSettingsContract = {
  settings: base
    .route({
      method: 'GET',
      path: '/email/settings',
      summary: 'Get email sending settings',
      description: 'How the organisation sends its emails; null: through the server’s',
    })
    .output(EmailSettings.nullable()),
  saveSettings: base
    .route({
      method: 'PUT',
      path: '/email/settings',
      summary: 'Change email sending settings',
      description:
        'Send the organisation’s emails this way. 400 INVALID_URL for an SMTP server core may not reach, INVALID_INPUT without the secret the first time',
    })
    .input(EmailSettingsInput)
    .output(EmailSettings),
  removeSettings: base
    .route({
      method: 'DELETE',
      path: '/email/settings',
      summary: 'Reset email sending settings',
      description: 'Send the organisation’s emails through the server’s again',
    })
    .output(z.object({ ok: z.literal(true) })),
  sendTest: base
    .errors({ EMAIL_NOT_CONFIGURED: ERRORS.EMAIL_NOT_CONFIGURED })
    .route({
      method: 'POST',
      path: '/email/settings/test',
      summary: 'Send a test email',
      description:
        'Send a test email with the saved settings, to me or to `to`, and say how it went. 409 EMAIL_NOT_CONFIGURED when email can’t be delivered',
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
