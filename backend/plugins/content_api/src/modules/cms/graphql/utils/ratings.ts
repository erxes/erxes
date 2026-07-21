import { IModels } from '~/connectionResolvers';
import { IPostRatingOverview, IPostRatingSummary } from '@/cms/@types/ratings';

export const createEmptyPostRatingSummary = (): IPostRatingSummary => ({
  averageRating: 0,
  totalCount: 0,
  distribution: [1, 2, 3, 4, 5].map((rating) => ({ rating, count: 0 })),
});

export const getPostRatingOverview = async ({
  models,
  postId,
  clientPortalId,
  authorId,
  enabled,
}: {
  models: IModels;
  postId: string;
  clientPortalId: string;
  authorId?: string;
  enabled: boolean;
}): Promise<IPostRatingOverview> => {
  const [summary, myRating] = await Promise.all([
    enabled
      ? models.PostRatings.getSummary(postId, clientPortalId)
      : Promise.resolve(createEmptyPostRatingSummary()),
    authorId
      ? models.PostRatings.findOne({ postId, clientPortalId, authorId })
      : Promise.resolve(null),
  ]);

  return { enabled, summary, myRating };
};
