import { oc } from '@orpc/contract';
import { z } from 'zod';
import { COMMON_ERRORS } from './errors';

const Address = z.string().trim().check(z.email()).max(254);

/** A plain message erxes emails for a plugin: a subject, paragraphs and an optional button. */
export const EmailMessage = z.object({
  to: z.array(Address).min(1).max(50),
  subject: z.string().trim().min(1).max(200),
  /** Text; a blank line starts a new paragraph. */
  body: z.string().trim().min(1).max(20_000),
  /** Where replies go, such as the organisation's support inbox. */
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
    .errors(COMMON_ERRORS)
    .route({
      method: 'POST',
      path: '/emails',
      successStatus: 202,
      summary:
        "Email up to 50 addresses from erxes's address (plugins with emails:write). Queued and retried; an address that fails doesn't stop the others",
    })
    .input(EmailMessage)
    .output(z.object({ queued: z.int() })),
};
