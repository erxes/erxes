import { Resolver } from 'erxes-api-shared/core-types';
import { IContext } from '~/connectionResolvers';
import {
  requireClientPortalId,
  getClientPortalUserId,
} from '@/cms/graphql/utils/clientPortal';
import {
  hasCmsPermission,
  requireCmsPermission,
} from '@/cms/utils/permissions';
import { CMS_POST_ACTIONS } from '~/meta/permissions';

export const postCommentMutations: Record<string, Resolver> = {
  cmsPostCommentAdd: async (_parent: any, args: any, context: IContext) => {
    const { models, user } = context;
    const { input } = args;

    await requireCmsPermission(context, CMS_POST_ACTIONS.update);

    return models.PostComments.createComment({
      ...input,
      authorKind: 'user',
      authorId: user._id,
      status: 'approved',
    });
  },

  cmsPostCommentUpdate: async (_parent: any, args: any, context: IContext) => {
    const { models, user } = context;
    const { _id, content } = args;

    await requireCmsPermission(context, CMS_POST_ACTIONS.update);

    const comment = await models.PostComments.findOne({ _id }).lean();
    if (!comment) throw new Error('Comment not found');

    const canModerate = await hasCmsPermission(context, CMS_POST_ACTIONS.remove);
    if (comment.authorId !== user._id && !canModerate) {
      throw new Error('Not authorized to edit this comment');
    }

    return models.PostComments.updateComment(_id, content);
  },

  cmsPostCommentDelete: async (_parent: any, args: any, context: IContext) => {
    const { models, user } = context;
    const { _id } = args;

    await requireCmsPermission(context, CMS_POST_ACTIONS.update);

    const comment = await models.PostComments.findOne({ _id }).lean();
    if (!comment) throw new Error('Comment not found');

    const canRemoveAny = await hasCmsPermission(context, CMS_POST_ACTIONS.remove);
    if (comment.authorId !== user._id && !canRemoveAny) {
      throw new Error('Not authorized to delete this comment');
    }

    return models.PostComments.deleteComment(_id);
  },

  cmsPostCommentChangeStatus: async (
    _parent: any,
    args: any,
    context: IContext,
  ) => {
    const { models } = context;
    const { _id, status } = args;

    await requireCmsPermission(context, CMS_POST_ACTIONS.approve);

    const comment = await models.PostComments.findOneAndUpdate(
      { _id },
      { $set: { status } },
      { new: true },
    );
    if (!comment) throw new Error('Comment not found');
    return comment;
  },

  cpPostCommentAdd: async (_parent: any, args: any, context: IContext) => {
    const { models } = context;
    const { input } = args;
    const clientPortalId = requireClientPortalId(context);
    const authorId = getClientPortalUserId(context);

    if (!authorId) throw new Error('Authentication required');

    const cms = await models.CMS.findOne({ clientPortalId }).lean();
    if (!cms?.allowComments) {
      throw new Error('Comments are disabled for this site');
    }

    const post = await models.Posts.findOne({
      _id: input.postId,
      clientPortalId,
    }).lean();
    if (!post) throw new Error('Post not found');

    return models.PostComments.createComment({
      ...input,
      clientPortalId,
      authorKind: 'portalUser',
      authorId,
      status: 'pending',
    });
  },

  cpPostCommentUpdate: async (_parent: any, args: any, context: IContext) => {
    const { models } = context;
    const { _id, content } = args;
    const clientPortalId = requireClientPortalId(context);
    const authorId = getClientPortalUserId(context);

    if (!authorId) throw new Error('Authentication required');

    const comment = await models.PostComments.findOne({
      _id,
      clientPortalId,
    }).lean();
    if (!comment) throw new Error('Comment not found');
    if (comment.authorId !== authorId) {
      throw new Error('Not authorized to edit this comment');
    }

    return models.PostComments.updateComment(_id, content);
  },

  cpPostCommentDelete: async (_parent: any, args: any, context: IContext) => {
    const { models } = context;
    const { _id } = args;
    const clientPortalId = requireClientPortalId(context);
    const authorId = getClientPortalUserId(context);

    if (!authorId) throw new Error('Authentication required');

    const comment = await models.PostComments.findOne({
      _id,
      clientPortalId,
    }).lean();
    if (!comment) throw new Error('Comment not found');
    if (comment.authorId !== authorId) {
      throw new Error('Not authorized to delete this comment');
    }

    return models.PostComments.deleteComment(_id);
  },
};

postCommentMutations.cpPostCommentAdd.wrapperConfig = { forClientPortal: true };
postCommentMutations.cpPostCommentUpdate.wrapperConfig = {
  forClientPortal: true,
};
postCommentMutations.cpPostCommentDelete.wrapperConfig = {
  forClientPortal: true,
};
