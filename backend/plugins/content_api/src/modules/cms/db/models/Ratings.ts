import { IModels } from '~/connectionResolvers';
import {
  IPostRating,
  IPostRatingDocument,
  IPostRatingSummary,
  PostRatingStatus,
} from '@/cms/@types/ratings';
import { postRatingSchema } from '@/cms/db/definitions/ratings';
import { assertValidPostRating } from '@/cms/utils/ratingValidation';

export { IPostRatingModel } from '@/cms/@types/ratings';

interface RatingGroup {
  _id: number;
  count: number;
}

export const loadPostRatingClass = (models: IModels) => {
  class PostRatings {
    public static readonly setRating = async (
      doc: IPostRating,
    ): Promise<IPostRatingDocument> => {
      assertValidPostRating(doc.rating);

      const rating = await models.PostRatings.findOneAndUpdate(
        {
          postId: doc.postId,
          clientPortalId: doc.clientPortalId,
          authorId: doc.authorId,
        },
        { $set: { rating: doc.rating, status: doc.status } },
        { new: true, upsert: true, setDefaultsOnInsert: true },
      );

      if (!rating) {
        throw new Error('Failed to save rating');
      }

      return rating;
    };

    public static readonly changeStatus = async (
      _id: string,
      status: PostRatingStatus,
    ): Promise<IPostRatingDocument> => {
      const rating = await models.PostRatings.findOneAndUpdate(
        { _id },
        { $set: { status } },
        { new: true },
      );

      if (!rating) {
        throw new Error('Rating not found');
      }

      return rating;
    };

    public static readonly deleteRating = async (filter: {
      postId: string;
      clientPortalId: string;
      authorId: string;
    }): Promise<{ deletedCount?: number }> =>
      models.PostRatings.deleteOne(filter);

    public static readonly getSummary = async (
      postId: string,
      clientPortalId: string,
    ): Promise<IPostRatingSummary> => {
      const groups = await models.PostRatings.aggregate<RatingGroup>([
        {
          $match: {
            postId,
            clientPortalId,
            status: 'approved',
          },
        },
        { $group: { _id: '$rating', count: { $sum: 1 } } },
      ]);

      const counts = new Map(groups.map(({ _id, count }) => [_id, count]));
      const distribution = [1, 2, 3, 4, 5].map((rating) => ({
        rating,
        count: counts.get(rating) ?? 0,
      }));
      const totalCount = distribution.reduce(
        (total, bucket) => total + bucket.count,
        0,
      );
      const ratingTotal = distribution.reduce(
        (total, bucket) => total + bucket.rating * bucket.count,
        0,
      );

      return {
        averageRating: totalCount === 0 ? 0 : ratingTotal / totalCount,
        totalCount,
        distribution,
      };
    };
  }

  postRatingSchema.loadClass(PostRatings);
  return postRatingSchema;
};
