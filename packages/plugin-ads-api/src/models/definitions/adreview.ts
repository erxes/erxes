import { Model, Schema, Document } from 'mongoose';
import { field } from './utils';

export interface IadReview {
  adId: string;
  review: number;
}
export interface IadReviewDocument extends IadReview, Document {
  _id: string;
  createdAt: Date;
  modifiedAt: Date;
}
export const adReviewSchema = new Schema({
  _id: field({ pkey: true }),
  adId: field({ type: String, label: 'AdId' }),
  review: field({ type: Number, label: 'Review' })
});
