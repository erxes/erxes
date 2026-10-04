import { Schema } from 'mongoose';
import { field, schemaHooksWrapper } from './utils';

const orderChangeEntrySchema = new Schema(
  {
    field: field({ type: String, label: 'Changed field' }),
    oldValue: field({
      type: Schema.Types.Mixed,
      optional: true,
      label: 'Previous value',
    }),
    newValue: field({
      type: Schema.Types.Mixed,
      optional: true,
      label: 'New value',
    }),
  },
  { _id: false },
);

export const orderChangeLogSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    // Persisted order reference; absent when the cart has never been saved.
    orderId: field({
      type: String,
      optional: true,
      label: 'Order',
      index: true,
    }),
    // Groups client actions for one cart: draft ID, or `order:<orderId>` for a saved order.
    cartId: field({ type: String, optional: true, label: 'Cart', index: true }),
    // Identifies one client action; retries reuse it to avoid duplicate logs per POS.
    eventId: field({ type: String, optional: true, label: 'Client event' }),
    // `cart` means a client-reported action; backend order-change logs leave this unset.
    source: field({ type: String, optional: true, label: 'Change source' }),
    // Action time reported by the client, or server time for backend order changes.
    occurredAt: field({ type: Date, label: 'Action time', index: true }),
    // POS scope and acting user are taken from authenticated backend context.
    posToken: field({ type: String, label: 'POS token', index: true }),
    userId: field({ type: String, optional: true, label: 'Changed user' }),
    // Server receipt time; can be later than occurredAt when an offline action is retried.
    createdAt: field({ type: Date, label: 'Created at', index: true }),
    changes: field({ type: [orderChangeEntrySchema], label: 'Changes' }),
  }),
  'erxes_order_change_logs',
);

orderChangeLogSchema.index({ posToken: 1, orderId: 1, createdAt: -1 });
orderChangeLogSchema.index({ posToken: 1, userId: 1, occurredAt: -1 });
orderChangeLogSchema.index(
  { posToken: 1, eventId: 1 },
  { unique: true, partialFilterExpression: { eventId: { $type: 'string' } } },
);
