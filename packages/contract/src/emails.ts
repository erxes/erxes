import { integrationConnections } from '@erxes/core-db/schema';
import { oc } from '@orpc/contract';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { Id, listOf } from './common';
import { emailAddressesContract } from './emailAddresses';
import { emailDeliveriesContract } from './emailDeliveries';
import { emailLimitsContract } from './emailLimits';
import { emailReplyTosContract } from './emailReplyTos';
import { emailSettingsContract } from './emailSettings';
import { COMMON_ERRORS, ERRORS } from './errors';

const Address = z.string().trim().check(z.email()).max(254);

/** A plain message erxes emails for a plugin: a subject, paragraphs and an optional button. */
export const EmailMessage = z.object({
  to: z.array(Address).min(1).max(50),
  subject: z.string().trim().min(1).max(200),
  /** Text; a blank line starts a new paragraph. */
  body: z.string().trim().min(1).max(20_000),
  /** Where replies go: one of the organisation's verified Reply-To addresses (400 otherwise). */
  replyTo: Address.optional(),
  /**
   * The Mail service connection it goes through, from that connection's address
   * (`emails.mailConnections`); left out: Organization email. 400 for one that isn't on.
   */
  connectionId: z.string().min(1).max(64).optional(),
  /**
   * A portal the plugin is on (a store, a site): the email goes out as that portal's emails do,
   * through its Send through connection (Organization email while it is off), under its sender
   * name, with its Reply-To unless `replyTo` is given. Not with `connectionId`.
   */
  portalId: z.string().min(1).max(64).optional(),
  button: z
    .object({
      label: z.string().trim().min(1).max(60),
      link: z.url({ protocol: /^https$/ }).max(2000),
    })
    .optional(),
});

export type EmailMessage = z.infer<typeof EmailMessage>;

/** A Mail service connection (SMTP, Amazon SES, SendGrid) an email may go out through. */
export const MailConnection = createSelectSchema(integrationConnections, { id: Id })
  .pick({ id: true, key: true, name: true })
  .extend({
    /** Its emails come from this address. */
    fromEmail: z.string(),
    /** Its emails' name; null: the organisation's. A message's own label replaces it. */
    fromName: z.string().nullable(),
  });

export type MailConnection = z.infer<typeof MailConnection>;

export const emailsContract = {
  send: oc
    .errors({
      ...COMMON_ERRORS,
      EMAIL_NOT_CONFIGURED: ERRORS.EMAIL_NOT_CONFIGURED,
      UNKNOWN_PORTAL: ERRORS.UNKNOWN_PORTAL,
    })
    .route({
      method: 'POST',
      path: '/emails',
      successStatus: 202,
      summary: 'Send an email',
      description:
        "Email up to 50 addresses as a portal's emails go (`portalId`), through a Mail service connection (`connectionId`), or through Organization email (plugins with emails:write). Queued and retried; an address that fails doesn't stop the others. 400 INVALID_INPUT for a replyTo that isn't verified, a connection that isn't on, or both portalId and connectionId; 400 UNKNOWN_PORTAL for a portal the plugin isn't on; 409 EMAIL_NOT_CONFIGURED when Organization email can't be delivered",
    })
    .input(EmailMessage)
    .output(z.object({ queued: z.int() })),
  mailConnections: oc
    .errors(COMMON_ERRORS)
    .route({
      method: 'GET',
      path: '/emails/mail-connections',
      summary: 'List mail connections',
      description:
        "The organisation's Mail service connections that are on (SMTP, Amazon SES, SendGrid in Settings › Integrations), oldest first: what `emails.send`'s `connectionId`, a portal and a broadcast may pick. Members, and plugins with emails:write",
    })
    .output(listOf(MailConnection)),
  ...emailSettingsContract,
  ...emailReplyTosContract,
  ...emailDeliveriesContract,
  ...emailAddressesContract,
  ...emailLimitsContract,
};
