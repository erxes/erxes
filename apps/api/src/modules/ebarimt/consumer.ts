import type { EventConsumer } from '~/modules/events/consumers';
import { queueReceiptSync } from './sync';

/** The payment events that change what an invoice's receipt should be. */
const RECEIPT_EVENTS = new Set(['core.payment.paid', 'core.payment.refunded']);

/**
 * eBarimt follows payments through their events, like webhooks and
 * automations do, so payments knows nothing of it (decision 41: core is
 * global). A paid or refunded invoice queues a sync of its receipt; the sync
 * itself decides whether one is issued, replaced or returned. Runs in the
 * event's transaction: the sync is queued once, whatever retries.
 */
export const ebarimtConsumer: EventConsumer = {
  name: 'core.ebarimt',
  async handle(tx, event) {
    if (event.source !== 'core' || !RECEIPT_EVENTS.has(event.type)) return;

    if (event.entityType !== 'payment_invoice' || !event.entityId) return;

    await queueReceiptSync(tx, { orgId: event.orgId, id: event.entityId });
  },
};
