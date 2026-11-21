import { suppressions } from '@erxes/core-db/schema';
import { oc } from '@orpc/contract';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { cursorPageOf, CursorQuery, EmailAddress, Id, isoDate, PhoneNumber } from './common';
import { COMMON_ERRORS } from './errors';
import { BroadcastChannel, SuppressionReason } from './values';

/**
 * An address that gets no broadcasts, and why. An email address that bounced,
 * complained or was added by a member gets no email at all, not even a password reset.
 */
export const Suppression = createSelectSchema(suppressions, {
  id: Id,
  createdAt: isoDate,
}).pick({
  id: true,
  channel: true,
  address: true,
  reason: true,
  /** The server's words for a bounce, or a member's note. */
  detail: true,
  /** The broadcast an unsubscribe or a bounce came from. */
  broadcastId: true,
  createdBy: true,
  createdAt: true,
});

export type Suppression = z.infer<typeof Suppression>;

const base = oc.errors(COMMON_ERRORS);

const Detail = z.string().trim().max(500).optional();

/** Addresses that get no broadcasts (decision 47). */
export const suppressionsContract = {
  list: base
    .route({ method: 'GET', path: '/suppressions', summary: 'Suppressed addresses, newest first' })
    .input(
      CursorQuery.extend({
        channel: BroadcastChannel.optional(),
        reason: SuppressionReason.optional(),
        search: z.string().trim().max(100).optional(),
      }),
    )
    .output(cursorPageOf(Suppression)),
  add: base
    .route({
      method: 'POST',
      path: '/suppressions',
      summary:
        'Stop broadcasts and every other email to addresses (reason `manual`); an address already suppressed keeps its reason',
    })
    .input(
      z.discriminatedUnion('channel', [
        z.object({
          channel: z.literal('email'),
          addresses: z.array(EmailAddress).min(1).max(500),
          detail: Detail,
        }),
        z.object({
          channel: z.literal('sms'),
          addresses: z.array(PhoneNumber).min(1).max(500),
          detail: Detail,
        }),
      ]),
    )
    .output(z.object({ added: z.int() })),
  remove: base
    .route({
      method: 'DELETE',
      path: '/suppressions/{id}',
      summary:
        'Let broadcasts and every other email reach the address again. 403 NOT_ALLOWED for an unsubscribe or a complaint: only the person can undo those',
    })
    .input(z.object({ id: Id }))
    .output(z.object({ ok: z.literal(true) })),
};
