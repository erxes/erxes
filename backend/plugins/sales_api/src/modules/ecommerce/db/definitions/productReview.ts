import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';

export const productReviewSchema = new Schema({
  _id: mongooseStringRandomId,
  productId: { type: String, label: 'Product' },
  customerId: { type: String, label: 'Customer' },
  review: { type: Number, label: 'Review' },
  description: { type: String, label: 'Description' },
  info: { type: Object, label: 'Info' },
  createdAt: { type: Date, label: 'Created Date' },
  modifiedAt: { type: Date, label: 'Modified Date' },
});
