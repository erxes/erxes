import {
  ICursorPaginateParams,
  Resolver,
} from 'erxes-api-shared/core-types';
import { cursorPaginate } from 'erxes-api-shared/utils';
import { FilterQuery } from 'mongoose';
import { IContext } from '~/connectionResolvers';
import { IPostCommentDocument } from '@/cms/@types/comments';
import { requireClientPortalId } from '@/cms/graphql/utils/clientPortal';
import { assertCmsAccessByClientPortal } from '@/cms/utils/cms-access';
import { assertCmsDocumentAccess } from '@/cms/utils/permissions';
import { CMS_POST_ACTIONS } from '~/meta/permissions';

interface CommentQueryArgs extends ICursorPaginateParams {
  postId: string;
  clientPortalId: string;
  parentId?: string | null;
}

const buildCommentQuery = (
  args: CommentQueryArgs,
  clientPortalId: string,
): FilterQuery<IPostCommentDocument> => {
  const query: FilterQuery<IPostCommentDocument> = {
    postId: args.postId,
    clientPortalId,
  };

  if (args.parentId !== undefined) {
    query.parentId = args.parentId || null;
  }

  return query;
};

export const postCommentQueries: Record<string, Resolver> = {
  cmsPostComments: async (
    _parent: unknown,
    args: CommentQueryArgs,
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

    const query = buildCommentQuery(args, args.clientPortalId);
    const { list, totalCount, pageInfo } = await cursorPaginate({
      model: models.PostComments,
      params: { ...args, orderBy: { createdAt: -1 } },
      query,
    });

    return { comments: list, totalCount, pageInfo };
  },

  cpPostComments: async (
    _parent: unknown,
    args: CommentQueryArgs,
    context: IContext,
  ) => {
    const { models } = context;
    const clientPortalId = requireClientPortalId(context);

    const cms = await models.CMS.findOne({ clientPortalId }).lean();
    if (!cms?.allowComments) {
      throw new Error('Comments are disabled for this site');
    }

    const post = await models.Posts.findOne({
      _id: args.postId,
      clientPortalId,
      status: 'published',
    })
      .select({ _id: 1 })
      .lean();

    if (!post) {
      throw new Error('Published post not found');
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
