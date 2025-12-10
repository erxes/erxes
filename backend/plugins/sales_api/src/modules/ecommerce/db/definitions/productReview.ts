import { Schema } from 'mongoose';

export const productReviewSchema = new Schema({
  _id: { type: String, required: true },
  productId: ({ type: String, label: 'Product' }),
  customerId: ({ type: String, label: 'Customer' }),
  review: ({ type: Number, label: 'Review' }),
  description: ({ type: String, label: 'Description' }),
  info: ({ type: Object, label: 'Info' }),
  createdAt: ({ type: Date, label: 'Created Date' }),
  modifiedAt: ({ type: Date, label: 'Modified Date' }),
});
