import { Schema } from 'mongoose';

export const wishlistSchema = new Schema({
  _id: { type: String, required: true } ,
  productId: ({ type: String, label: 'ProductId' }),
  customerId: ({ type: String, label: 'CustomerId' })
});
