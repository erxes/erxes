import { Schema } from 'mongoose';
import { CURRENCIES, PAYMENTS } from '~/constants';

import { mongooseStringRandomId, schemaWrapper } from 'erxes-api-shared/utils';

export const paymentSchema = schemaWrapper(
  new Schema(
    {
      _id: mongooseStringRandomId,
      name: { type: String, label: 'Name' },
      kind: { type: String, label: 'Kind', enum: PAYMENTS.ALL },
      status: { type: String, label: 'Status' },
      config: { type: Object, label: 'Config' },
      acceptedCurrencies: { type: [String], label: 'Accepted currencies', enum: CURRENCIES },
    },
    {
      timestamps: true,
    },
  ),
);
