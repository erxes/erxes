import { IContext, IModels } from '~/connectionResolvers';
import { IPostRatingOverview, IPostRatingSummary } from '@/cms/@types/ratings';
import { assertCmsAccessByClientPortal } from '@/cms/utils/cms-access';
import { assertCmsDocumentAccess } from '@/cms/utils/permissions';

export const assertStaffRatingAccess = async ({
  context,
  postId,
  clientPortalId,
  action,
}: {
  context: IContext;
  postId: string;
  clientPortalId: string;
  action: string;
}) => {
  await assertCmsAccessByClientPortal(context, clientPortalId);

  const post = await context.models.Posts.findOne({
    _id: postId,
    clientPortalId,
  }).lean();

  if (!post) {
    throw new Error('Post not found');
  }

  await assertCmsDocumentAccess({ context, actions: action, document: post });
};

const getPortalPost = async (
  context: IContext,
  postId: string,
  clientPortalId: string,
  publishedOnly: boolean,
) => {
  const post = await context.models.Posts.findOne({
    _id: postId,
    clientPortalId,
    ...(publishedOnly ? { status: 'published' } : {}),
  })
    .select({ _id: 1 })
    .lean();

  if (!post) {
    throw new Error(
      publishedOnly ? 'Published post not found' : 'Post not found',
    );
  }

  return post;
};

export const getPublishedPost = (
  context: IContext,
  postId: string,
  clientPortalId: string,
) => getPortalPost(context, postId, clientPortalId, true);

export const getExistingPost = (
  context: IContext,
  postId: string,
  clientPortalId: string,
) => getPortalPost(context, postId, clientPortalId, false);

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
