import { Schema } from 'mongoose';
import { PAYMENT_STATUS } from '~/constants';

import { mongooseStringRandomId, schemaWrapper } from 'erxes-api-shared/utils';

export const transactionSchema = schemaWrapper(
  new Schema({
    _id: mongooseStringRandomId,
    invoiceId: { type: String },
    code: { type: String, required: false, unique: true },
    paymentId: { type: String },
    paymentKind: { type: String },
    amount: { type: Number },
    status: { type: String, default: PAYMENT_STATUS.PENDING },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date },
    details: { type: Object },
    description: { type: String },
    response: { type: Object },
  }),
);

// TODO: readd after server time issue fixed
// transactionSchema.index(
//   { createdAt: 1 },
//   {
//     expireAfterSeconds: 24 * 60 * 60,
//     partialFilterExpression: {
//       status: PAYMENT_STATUS.PENDING,
//     },
//   }
// );
