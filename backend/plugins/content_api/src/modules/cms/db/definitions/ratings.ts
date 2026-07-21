import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';
import { IPostRatingDocument } from '@/cms/@types/ratings';

export const postRatingSchema = new Schema<IPostRatingDocument>(
  {
    _id: mongooseStringRandomId,
    postId: { type: String, required: true },
    clientPortalId: { type: String, required: true },
    authorId: { type: String, required: true },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      validate: {
        validator: Number.isInteger,
        message: 'Rating must be an integer from 1 to 5',
      },
    },
    status: {
      type: String,
      required: true,
      default: 'pending',
      enum: ['pending', 'approved', 'rejected'],
    },
  },
  { timestamps: true },
);

postRatingSchema.index(
  { clientPortalId: 1, postId: 1, authorId: 1 },
  { unique: true },
);
postRatingSchema.index({ clientPortalId: 1, postId: 1, status: 1, rating: 1 });
