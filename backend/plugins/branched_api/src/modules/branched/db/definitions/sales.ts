import { schemaWrapper } from 'erxes-api-shared/utils';
import { Schema } from 'mongoose';

export const saleSchema = schemaWrapper(
  new Schema(
    {
      amount: { type: Number, required: true, label: 'Amount' },
      date: { type: Date, required: true, label: 'Date', esType: 'date' },
      branchId: { type: String, required: true, esType: 'keyword', index: true },
      productId: { type: String, required: true, esType: 'keyword' },
      quantity: { type: Number, required: true, label: 'Quantity' },
      customerId: { type: String, optional: true, esType: 'keyword' },
      description: { type: String, optional: true, label: 'Description' },
      paymentType: { type: String, optional: true, label: 'Payment type' },
      status: {
        type: String,
        enum: ['pending', 'completed', 'cancelled'],
        default: 'completed',
        label: 'Status',
      },
      discount: { type: Number, optional: true, label: 'Discount' },
      tax: { type: Number, optional: true, label: 'Tax' },
    },
    { timestamps: true },
  ),
);
