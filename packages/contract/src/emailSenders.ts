import { emailSenders } from '@erxes/core-db/schema';
import { oc } from '@orpc/contract';
import { createSelectSchema, createUpdateSchema } from 'drizzle-zod';
import { z } from 'zod';
import { Id, isoDate, listOf } from './common';
import { COMMON_ERRORS, ERRORS } from './errors';

export const EmailSender = createSelectSchema(emailSenders, {
  id: Id,
  confirmedAt: isoDate,
  createdAt: isoDate,
}).pick({
  id: true,
  email: true,
  /** Shown as the From name. */
  name: true,
  /** Null: the confirmation link emailed to the address wasn't opened yet. */
  confirmedAt: true,
  createdAt: true,
});

export type EmailSender = z.infer<typeof EmailSender>;

const SenderFields = createUpdateSchema(emailSenders, {
  email: (email) => email.trim().toLowerCase().check(z.email()).max(254),
  name: (name) =>
    name
      .trim()
      .min(1)
      .max(80)
      .regex(/^[^<>"\r\n]*$/, 'no quotes, brackets or line breaks'),
})
  .pick({ email: true, name: true })
  .required({ email: true, name: true });

const { NOT_PENDING } = ERRORS;

const base = oc.errors({ ...COMMON_ERRORS, NOT_PENDING });

/**
 * Addresses broadcasts and automations may send as (Settings › Integrations ›
 * Email sending › Senders, `integrations.manage`). Adding one emails it a
 * confirmation link; it is usable once the link is opened. A sender on the
 * sending address's domain is the From; any other is the Reply-To, and the
 * email goes out from the sending address under the sender's name.
 */
export const emailSendersContract = {
  senders: base
    .route({
      method: 'GET',
      path: '/email/senders',
      summary: 'The senders, confirmed or waiting, by address (any member, for the pickers)',
    })
    .output(listOf(EmailSender)),
  addSender: base
    .route({
      method: 'POST',
      path: '/email/senders',
      successStatus: 201,
      summary:
        'Add a sender and email it a confirmation link. 409 TAKEN when the address is a sender already',
    })
    .input(SenderFields)
    .output(EmailSender),
  resendConfirmation: base
    .route({
      method: 'POST',
      path: '/email/senders/{id}/resend',
      summary: 'Email the confirmation link again. 409 NOT_PENDING when it is confirmed already',
    })
    .input(z.object({ id: Id }))
    .output(z.object({ ok: z.literal(true) })),
  removeSender: base
    .route({
      method: 'DELETE',
      path: '/email/senders/{id}',
      summary: 'Remove a sender; broadcasts and automations using it send from the sending address',
    })
    .input(z.object({ id: Id }))
    .output(z.object({ ok: z.literal(true) })),
};
