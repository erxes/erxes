import { Schema } from 'mongoose';
import { CURRENCIES, PAYMENTS, PAYMENT_METHOD_STATUS } from '~/constants';

import { mongooseStringRandomId, schemaWrapper } from 'erxes-api-shared/utils';

export const paymentSchema = schemaWrapper(
  new Schema(
    {
      _id: mongooseStringRandomId,
      name: { type: String, label: 'Name' },
      kind: { type: String, label: 'Kind', enum: PAYMENTS.ALL },
      status: {
        type: String,
        label: 'Status',
        enum: PAYMENT_METHOD_STATUS.ALL,
        default: PAYMENT_METHOD_STATUS.ACTIVE,
      },
      config: { type: Object, label: 'Config' },
      acceptedCurrencies: {
        type: [String],
        label: 'Accepted currencies',
        enum: CURRENCIES,
      },
    },
    {
      timestamps: true,
    },
  ),
);
