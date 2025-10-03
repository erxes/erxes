import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';

import { IReview, IReviewDocument } from '@/ota/@types/reviews';
import { reviewSchema } from '@/ota/db/definitions/reviews';

export interface IReviewModel extends Model<IReviewDocument> {
  createReview: (data: IReview) => Promise<IReviewDocument>;
  updateReview: (
    id: string,
    data: Partial<IReview>,
  ) => Promise<IReviewDocument | null>;
  deleteReview: (id: string) => Promise<IReviewDocument | null>;
}

export const loadReviewClass = (models: IModels) => {
  const reviewMethods = {
    createReview: async (data: IReview) => {
      return models.Reviews.create(data);
    },

    updateReview: async (_id: string, data: Partial<IReview>) => {
      return models.Reviews.findOneAndUpdate(
        { _id },
        { $set: data },
        { new: true },
      );
    },

    deleteReview: async (_id: string) => {
      return models.Reviews.findOneAndDelete({ _id });
    },
  };

  reviewSchema.statics = reviewMethods;
  return reviewSchema;
};
