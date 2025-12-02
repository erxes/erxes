import { Schema } from 'mongoose';

export const wishlistSchema = new Schema({
  _id: ({ pkey: true }),
  productId: ({ type: String, label: 'ProductId' }),
  customerId: ({ type: String, label: 'CustomerId' })
});
