import { emailAddresses, suppressions } from '@erxes/core-db/schema';
import { oc } from '@orpc/contract';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { cursorPageOf, CursorQuery, Id, isoDate } from './common';
import { COMMON_ERRORS } from './errors';
import { EmailLane, SuppressionReason } from './values';

/**
 * An address the organisation emailed or suppressed, and its standing. The id is its address record's, else its
 * suppression's.
 */
export const EmailAddressStanding = createSelectSchema(emailAddresses, {
  id: Id,
  sentCount: () => z.int(),
  lastSentAt: isoDate,
  deliveredCount: () => z.int(),
  softBounces: () => z.int(),
  lastDeliveredAt: isoDate,
  lastBouncedAt: isoDate,
  createdAt: isoDate,
})
  .pick({
    id: true,
    email: true,
    /** Emails the provider took for it; they prove nothing until it reports a delivery. */
    sentCount: true,
    lastSentAt: true,
    /** Deliveries the provider reported. */
    deliveredCount: true,
    lastDeliveredAt: true,
    /** Deferrals and bounces that don't suppress, since the last delivery. */
    softBounces: true,
    lastBouncedAt: true,
    /** When erxes first heard of the address. */
    createdAt: true,
  })
  .extend({
    /**
     * `proven` (the provider reported a delivery in the last 180 days), `suppressed` (it gets
     * no email: see `suppressionReason`) or `unknown`. Worked out when read.
     */
    lane: EmailLane,
    /** Its entry in the suppression list: `DELETE /suppressions/{id}` reopens a bounce or a member's entry. */
    suppressionId: Id.nullable(),
    suppressionReason: SuppressionReason.nullable(),
    /** The server's words for a bounce, or a member's note. */
    suppressionDetail: createSelectSchema(suppressions).shape.detail,
    suppressedAt: isoDate().nullable(),
  });

export type EmailAddressStanding = z.infer<typeof EmailAddressStanding>;

/** Each address's standing (Settings › Integrations › Email sending › Addresses). */
export const emailAddressesContract = {
  addresses: oc
    .errors(COMMON_ERRORS)
    .route({
      method: 'GET',
      path: '/email/addresses',
      summary: 'List emailed addresses',
      description:
        'Addresses the organisation emailed or suppressed, newest first, each with its standing',
    })
    .input(
      CursorQuery.extend({
        lane: EmailLane.optional(),
        /** Part of the address. */
        search: z.string().trim().max(100).optional(),
      }),
    )
    .output(cursorPageOf(EmailAddressStanding)),
};
