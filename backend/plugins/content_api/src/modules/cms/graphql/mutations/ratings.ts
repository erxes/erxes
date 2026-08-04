import { Resolver } from 'erxes-api-shared/core-types';
import { IContext } from '~/connectionResolvers';
import { PostRatingStatus } from '@/cms/@types/ratings';
import { requireClientPortalId } from '@/cms/graphql/utils/clientPortal';
import {
  assertStaffRatingAccess,
  getExistingPost,
  getPostRatingOverview,
  getPublishedPost,
} from '@/cms/graphql/utils/ratings';
import { assertValidPostRating } from '@/cms/utils/ratingValidation';
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
    const authorId = context.cpUser?._id;

    if (!authorId) {
      throw new Error('Authentication required');
    }

    assertValidPostRating(args.rating);

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
    const authorId = context.cpUser?._id;

    if (!authorId) {
      throw new Error('Authentication required');
    }

    const cms = await models.CMS.findOne({ clientPortalId }).lean();
    await getExistingPost(context, args.postId, clientPortalId);
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
