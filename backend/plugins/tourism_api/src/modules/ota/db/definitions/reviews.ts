import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';
import { IReviewDocument } from '@/ota/@types/reviews';

export const reviewSchema = new Schema<IReviewDocument>(
  {
    _id: mongooseStringRandomId,
    customerId: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: false },
    type: { type: String, required: true, enum: ['hotel', 'tour'] },
    objectId: { type: String, required: true },
    bookingId: { type: String, required: true },
  },
  { timestamps: true },
);

reviewSchema.index({ type: 1, objectId: 1 });
reviewSchema.index({ bookingId: 1 });
