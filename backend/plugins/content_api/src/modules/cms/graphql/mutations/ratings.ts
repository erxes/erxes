import { Resolver } from 'erxes-api-shared/core-types';
import { IContext } from '~/connectionResolvers';
import { PostRatingStatus } from '@/cms/@types/ratings';
import {
  requireClientPortalId,
  getClientPortalUserId,
} from '@/cms/graphql/utils/clientPortal';
import { getPostRatingOverview } from '@/cms/graphql/utils/ratings';
import { assertCmsAccessByClientPortal } from '@/cms/utils/cms-access';
import { assertCmsDocumentAccess } from '@/cms/utils/permissions';
import { CMS_POST_ACTIONS } from '~/meta/permissions';

interface RatingIdArgs {
  _id: string;
}

interface ChangeRatingStatusArgs extends RatingIdArgs {
  status: PostRatingStatus;
}

interface PortalRatingArgs {
  postId: string;
}

interface SetPortalRatingArgs extends PortalRatingArgs {
  rating: number;
}

const assertValidRating = (rating: number): void => {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error('Rating must be an integer from 1 to 5');
  }
};

const assertStaffRatingAccess = async ({
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

const getPublishedPost = async (
  context: IContext,
  postId: string,
  clientPortalId: string,
) => {
  const post = await context.models.Posts.findOne({
    _id: postId,
    clientPortalId,
    status: 'published',
  })
    .select({ _id: 1 })
    .lean();

  if (!post) {
    throw new Error('Published post not found');
  }

  return post;
};

export const postRatingMutations: Record<string, Resolver> = {
  cmsPostRatingChangeStatus: async (
    _parent: unknown,
    args: ChangeRatingStatusArgs,
    context: IContext,
  ) => {
    const { models } = context;
    const rating = await models.PostRatings.findOne({ _id: args._id }).lean();

    if (!rating) {
      throw new Error('Rating not found');
    }

    await assertStaffRatingAccess({
      context,
      postId: rating.postId,
      clientPortalId: rating.clientPortalId,
      action: CMS_POST_ACTIONS.approve,
    });

    return models.PostRatings.changeStatus(args._id, args.status);
  },

  cmsPostRatingDelete: async (
    _parent: unknown,
    args: RatingIdArgs,
    context: IContext,
  ) => {
    const { models } = context;
    const rating = await models.PostRatings.findOne({ _id: args._id }).lean();

    if (!rating) {
      throw new Error('Rating not found');
    }

    await assertStaffRatingAccess({
      context,
      postId: rating.postId,
      clientPortalId: rating.clientPortalId,
      action: CMS_POST_ACTIONS.remove,
    });

    return models.PostRatings.deleteOne({ _id: args._id });
  },

  cpPostRatingSet: async (
    _parent: unknown,
    args: SetPortalRatingArgs,
    context: IContext,
  ) => {
    const { models } = context;
    const clientPortalId = requireClientPortalId(context);
    const authorId = getClientPortalUserId(context);

    if (!authorId) {
      throw new Error('Authentication required');
    }

    assertValidRating(args.rating);

    const cms = await models.CMS.findOne({ clientPortalId }).lean();
    if (!cms?.allowRatings) {
      throw new Error('Ratings are disabled for this site');
    }

    await getPublishedPost(context, args.postId, clientPortalId);

    await models.PostRatings.setRating({
      postId: args.postId,
      clientPortalId,
      authorId,
      rating: args.rating,
      status: cms.autoApproveRatings ? 'approved' : 'pending',
    });

    return getPostRatingOverview({
      models,
      postId: args.postId,
      clientPortalId,
      authorId,
      enabled: true,
    });
  },

  cpPostRatingDelete: async (
    _parent: unknown,
    args: PortalRatingArgs,
    context: IContext,
  ) => {
    const { models } = context;
    const clientPortalId = requireClientPortalId(context);
    const authorId = getClientPortalUserId(context);

    if (!authorId) {
      throw new Error('Authentication required');
    }

    const cms = await models.CMS.findOne({ clientPortalId }).lean();
    await getPublishedPost(context, args.postId, clientPortalId);
    await models.PostRatings.deleteRating({
      postId: args.postId,
      clientPortalId,
      authorId,
    });

    return getPostRatingOverview({
      models,
      postId: args.postId,
      clientPortalId,
      authorId,
      enabled: Boolean(cms?.allowRatings),
    });
  },
};

postRatingMutations.cpPostRatingSet.wrapperConfig = { forClientPortal: true };
postRatingMutations.cpPostRatingDelete.wrapperConfig = {
  forClientPortal: true,
};
