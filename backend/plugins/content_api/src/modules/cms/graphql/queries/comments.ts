import { cursorPaginate } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { Resolver } from 'erxes-api-shared/core-types';
import { requireCmsPermission } from '@/cms/utils/permissions';
import {
  requireClientPortalId,
} from '@/cms/graphql/utils/clientPortal';
import { CMS_POST_ACTIONS } from '~/meta/permissions';

const buildCommentQuery = (
  args: any,
  clientPortalId: string,
): Record<string, any> => {
  const query: Record<string, any> = {
    postId: args.postId,
    clientPortalId,
  };
  if (args.parentId !== undefined) {
    query.parentId = args.parentId || null;
  }
  return query;
};

export const postCommentQueries: Record<string, Resolver> = {
  cmsPostComments: async (_parent: any, args: any, context: IContext) => {
    const { models } = context;
    await requireCmsPermission(context, CMS_POST_ACTIONS.read);

    const query = buildCommentQuery(args, args.clientPortalId);
    const { list, totalCount, pageInfo } = await cursorPaginate({
      model: models.PostComments,
      params: { ...args, orderBy: { createdAt: -1 } },
      query,
    });

    return { comments: list, totalCount, pageInfo };
  },

  cpPostComments: async (_parent: any, args: any, context: IContext) => {
    const { models } = context;
    const clientPortalId = requireClientPortalId(context);

    const cms = await models.CMS.findOne({ clientPortalId }).lean();
    if (!cms?.allowComments) {
      throw new Error('Comments are disabled for this site');
    }

    const query = buildCommentQuery(args, clientPortalId);
    query.status = 'approved';

    const { list, totalCount, pageInfo } = await cursorPaginate({
      model: models.PostComments,
      params: { ...args, orderBy: { createdAt: -1 } },
      query,
    });

    return { comments: list, totalCount, pageInfo };
  },
};

postCommentQueries.cpPostComments.wrapperConfig = { forClientPortal: true };
