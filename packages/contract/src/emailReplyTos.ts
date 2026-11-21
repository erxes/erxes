import { emailReplyTos } from '@erxes/core-db/schema';
import { oc } from '@orpc/contract';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { EmailAddress, Id, isoDate } from './common';
import { COMMON_ERRORS, ERRORS } from './errors';
import { EmailProvider } from './values';

export const EmailReplyTo = createSelectSchema(emailReplyTos, {
  verifiedAt: isoDate,
  createdAt: isoDate,
}).pick({
  id: true,
  email: true,
  /**
   * `pending` until the link sent to it is confirmed (SaaS only); self-hosted,
   * and a member's own address on SaaS, are `verified` at once.
   */
  status: true,
  verifiedAt: true,
  createdAt: true,
});

export type EmailReplyTo = z.infer<typeof EmailReplyTo>;

/** Who the organisation's emails come from, as they go out now. */
export const EmailSender = z.object({
  /** The address mail goes out from: `EMAIL_FROM`'s, or the organisation's own (self-hosted). */
  address: z.string(),
  /** The name every email carries when it gives none. */
  name: z.string(),
  /**
   * SaaS: the organisation's name always leads, and a broadcast or automation
   * adds only a label after it (`MSM Group · Marketing`). False: any name.
   */
  nameLocked: z.boolean(),
  /** Whether the organisation may send through its own provider (self-hosted only). */
  ownSending: z.boolean(),
  /** How the organisation's emails go out now: its own provider (self-hosted), else the server's. */
  provider: EmailProvider,
  /**
   * False in production when emails would only be written to the server's log
   * (nothing set up): broadcasts, tests and plugin emails are refused with 409
   * EMAIL_NOT_CONFIGURED. Sign-in, invitation and reset emails still go to the log.
   */
  canDeliver: z.boolean(),
});

export type EmailSender = z.infer<typeof EmailSender>;

const { INVALID_LINK } = ERRORS;

const base = oc.errors(COMMON_ERRORS);

/**
 * Who emails come from, and where replies may go. A broadcast, an automation
 * or a plugin's email can ask replies to go only to a verified address, so no
 * organisation sends with another's inbox as its Reply-To.
 */
export const emailReplyTosContract = {
  sender: base
    .route({
      method: 'GET',
      path: '/email/sender',
      summary: 'Who the organisation’s emails come from',
    })
    .output(EmailSender),
  replyTos: base
    .route({
      method: 'GET',
      path: '/email/reply-tos',
      summary: 'Addresses replies may go to, verified and waiting',
    })
    .output(z.array(EmailReplyTo)),
  addReplyTo: base
    .route({
      method: 'POST',
      path: '/email/reply-tos',
      summary:
        'Add a Reply-To address. Self-hosted, and a member’s own on SaaS: verified at once. Any other on SaaS gets a link to confirm it; asked again, a new link',
    })
    .input(z.object({ email: EmailAddress }))
    .output(EmailReplyTo),
  removeReplyTo: base
    .route({
      method: 'DELETE',
      path: '/email/reply-tos/{id}',
      summary: 'Stop using a Reply-To address',
    })
    .input(z.object({ id: Id }))
    .output(z.object({ ok: z.literal(true) })),
  confirmReplyTo: oc
    .errors({ ...COMMON_ERRORS, INVALID_LINK })
    .route({
      method: 'POST',
      path: '/email/reply-tos/confirm',
      summary:
        'Confirm a Reply-To address from the link sent to it. 400 INVALID_LINK once used or expired',
    })
    .input(z.object({ token: z.string().min(1).max(200) }))
    .output(z.object({ email: z.string(), organization: z.string() })),
};
