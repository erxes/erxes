import { ICursorPaginateParams, Resolver } from 'erxes-api-shared/core-types';
import { cursorPaginate } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { requireClientPortalId } from '@/cms/graphql/utils/clientPortal';
import {
  assertStaffRatingAccess,
  getPostRatingOverview,
  getPublishedPost,
} from '@/cms/graphql/utils/ratings';
import { CMS_POST_ACTIONS } from '~/meta/permissions';

interface StaffRatingQueryArgs extends ICursorPaginateParams {
  postId: string;
  clientPortalId: string;
}

interface PortalRatingQueryArgs {
  postId: string;
}

export const postRatingQueries: Record<string, Resolver> = {
  cmsPostRatings: async (
    _parent: unknown,
    args: StaffRatingQueryArgs,
    context: IContext,
  ) => {
    const { models } = context;

    await assertStaffRatingAccess({
      context,
      postId: args.postId,
      clientPortalId: args.clientPortalId,
      action: CMS_POST_ACTIONS.read,
    });

    const query = {
      postId: args.postId,
      clientPortalId: args.clientPortalId,
    };
    const [{ list, totalCount, pageInfo }, approvedSummary] = await Promise.all(
      [
        cursorPaginate({
          model: models.PostRatings,
          params: { ...args, orderBy: { createdAt: -1 } },
          query,
        }),
        models.PostRatings.getSummary(args.postId, args.clientPortalId),
      ],
    );

    return { ratings: list, totalCount, pageInfo, approvedSummary };
  },

  cpPostRatingOverview: async (
    _parent: unknown,
    args: PortalRatingQueryArgs,
    context: IContext,
  ) => {
    const { models } = context;
    const clientPortalId = requireClientPortalId(context);
    const authorId = context.cpUser?._id;

    const [cms] = await Promise.all([
      models.CMS.findOne({ clientPortalId }).lean(),
      getPublishedPost(context, args.postId, clientPortalId),
    ]);

    return getPostRatingOverview({
      models,
      postId: args.postId,
      clientPortalId,
      authorId,
      enabled: Boolean(cms?.allowRatings),
    });
  },
};

postRatingQueries.cpPostRatingOverview.wrapperConfig = {
  forClientPortal: true,
};
