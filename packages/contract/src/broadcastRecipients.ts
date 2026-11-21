import { broadcastRecipients } from '@erxes/core-db/schema';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { Id, isoDate } from './common';

/** Who a broadcast would reach now. */
export const BroadcastAudience = z.object({
  /** Customers the audience matches. */
  matched: z.int(),
  /** Of them, those with an address on the channel that isn't suppressed (one per address). */
  reachable: z.int(),
  /** Matched customers with no email (or phone) at all. */
  noAddress: z.int(),
  /** Matched customers whose address unsubscribed, bounced or was added by a member. */
  suppressed: z.int(),
});

export const BroadcastRecipient = createSelectSchema(broadcastRecipients, {
  id: Id,
  sentAt: isoDate,
  openedAt: isoDate,
  clickedAt: isoDate,
  unsubscribedAt: isoDate,
  updatedAt: isoDate,
})
  .pick({
    id: true,
    customerId: true,
    address: true,
    status: true,
    /** Why it failed or wasn't sent. */
    reason: true,
    attempts: true,
    sentAt: true,
    openedAt: true,
    clickedAt: true,
    unsubscribedAt: true,
    updatedAt: true,
  })
  .extend({ customerName: z.string().nullable() });

export type BroadcastRecipient = z.infer<typeof BroadcastRecipient>;

/** One customer's copy as it would be sent (`text` only for SMS). */
export const BroadcastRendered = z.object({
  to: z.string().nullable(),
  subject: z.string().nullable(),
  html: z.string().nullable(),
  text: z.string(),
});
