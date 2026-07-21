import { ICursorPaginateParams, Resolver } from 'erxes-api-shared/core-types';
import { cursorPaginate } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import {
  requireClientPortalId,
  getClientPortalUserId,
} from '@/cms/graphql/utils/clientPortal';
import { getPostRatingOverview } from '@/cms/graphql/utils/ratings';
import { assertCmsAccessByClientPortal } from '@/cms/utils/cms-access';
import { assertCmsDocumentAccess } from '@/cms/utils/permissions';
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

    await assertCmsAccessByClientPortal(context, args.clientPortalId);

    const post = await models.Posts.findOne({
      _id: args.postId,
      clientPortalId: args.clientPortalId,
    }).lean();

    if (!post) {
      throw new Error('Post not found');
    }

    await assertCmsDocumentAccess({
      context,
      actions: CMS_POST_ACTIONS.read,
      document: post,
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
    const authorId = getClientPortalUserId(context);

    const [cms, post] = await Promise.all([
      models.CMS.findOne({ clientPortalId }).lean(),
      models.Posts.findOne({
        _id: args.postId,
        clientPortalId,
        status: 'published',
      })
        .select({ _id: 1 })
        .lean(),
    ]);

    if (!post) {
      throw new Error('Published post not found');
    }

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
