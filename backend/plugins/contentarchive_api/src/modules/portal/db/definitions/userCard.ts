import { mongooseStringRandomId } from 'erxes-api-shared/utils';
import { Schema } from 'mongoose';

export const userCardSchema = new Schema({
  _id: mongooseStringRandomId,
  contentType: {
    type: String,
    enum: ['deal', 'task', 'ticket', 'purchase'],
  },
  contentTypeId: { type: String },
  portalUserId: { type: String },
  status: {
    type: String,
    default: 'participating',
    enum: [
      'participating',
      'invited',
      'left',
      'rejected',
      'won',
      'lost',
      'completed',
    ],
  },
  paymentStatus: { type: String, enum: ['paid', 'unpaid'] },
  paymentAmount: { type: Number },
  offeredAmount: { type: Number },
  hasVat: { type: Boolean },
  createdAt: { type: Date, default: Date.now },
  modifiedAt: { type: Date, default: Date.now },
});
