import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';

export const wishlistSchema = new Schema({
  _id: mongooseStringRandomId,
  productId: ({ type: String, label: 'ProductId' }),
  customerId: ({ type: String, label: 'CustomerId' })
});
