import { oc } from '@orpc/contract';
import { z } from 'zod';
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
  button: z
    .object({
      label: z.string().trim().min(1).max(60),
      link: z.url({ protocol: /^https$/ }).max(2000),
    })
    .optional(),
});

export type EmailMessage = z.infer<typeof EmailMessage>;

export const emailsContract = {
  send: oc
    .errors({ ...COMMON_ERRORS, EMAIL_NOT_CONFIGURED: ERRORS.EMAIL_NOT_CONFIGURED })
    .route({
      method: 'POST',
      path: '/emails',
      successStatus: 202,
      summary:
        "Email up to 50 addresses from the organisation's sender (plugins with emails:write). Queued and retried; an address that fails doesn't stop the others. 400 INVALID_INPUT for a replyTo that isn't verified, 409 EMAIL_NOT_CONFIGURED when email can't be delivered",
    })
    .input(EmailMessage)
    .output(z.object({ queued: z.int() })),
  ...emailSettingsContract,
  ...emailReplyTosContract,
  ...emailDeliveriesContract,
  ...emailAddressesContract,
  ...emailLimitsContract,
};
