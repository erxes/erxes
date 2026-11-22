import { emailDeliveries } from '@erxes/core-db/schema';
import { oc } from '@orpc/contract';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { cursorPageOf, CursorQuery, Id, isoDate } from './common';
import { COMMON_ERRORS } from './errors';
import { EmailDeliveryStatus, EmailSource } from './values';

/** One email the organisation sent, and what became of it. No body is kept. */
export const EmailDelivery = createSelectSchema(emailDeliveries, {
  id: Id,
  sentAt: isoDate,
  reportedAt: isoDate,
  createdAt: isoDate,
  updatedAt: isoDate,
}).pick({
  id: true,
  /** What it was for: `account`, `security`, `notification`, `customer`, `customer_account` (a sign-in code), `broadcast`, `automation`, `plugin`, `ebarimt`, `settings`. */
  source: true,
  /** The record it came from: the broadcast, the automation, the plugin's name, the receipt … */
  sourceId: true,
  to: true,
  subject: true,
  /**
   * `queued` (waiting, or waiting to try again), `sent` (the server took it) or `failed`; then,
   * from SendGrid's or SES's events, `delivered` (the recipient's server took it), `bounced`
   * or `complained` (marked as spam). A later event never moves it back. Not sent: `suppressed`
   * (`error` says why), `held` by the sending ramp until its next window (`error`: `daily_limit`
   * or `halted`; then `queued`), or `capped` (a sign-in email over the hourly cap to unproven
   * addresses).
   */
  status: true,
  /** What its last try went out through: `smtp`, `sendgrid`, `ses`, or `log` (not sent, `EMAIL_DRIVER=log`); null until tried. */
  provider: true,
  attempts: true,
  /** What the server said when it last refused, or why it couldn't be reached. */
  error: true,
  sentAt: true,
  /** When the provider's event behind `delivered`, `bounced` or `complained` happened. */
  reportedAt: true,
  /** Times the recipient's server asked the provider to try later. */
  deferrals: true,
  createdAt: true,
  updatedAt: true,
});

export type EmailDelivery = z.infer<typeof EmailDelivery>;

/** Every email the organisation sent in the last 90 days (Settings › Integrations › Email sending). */
export const emailDeliveriesContract = {
  deliveries: oc
    .errors(COMMON_ERRORS)
    .route({
      method: 'GET',
      path: '/email/deliveries',
      summary: 'List sent emails',
      description: 'Emails the organisation sent in the last 90 days, newest first',
    })
    .input(
      CursorQuery.extend({
        status: EmailDeliveryStatus.optional(),
        source: EmailSource.optional(),
        sourceId: z.string().max(64).optional(),
        /** Part of the address it went to. */
        search: z.string().trim().max(100).optional(),
      }),
    )
    .output(cursorPageOf(EmailDelivery)),
};
