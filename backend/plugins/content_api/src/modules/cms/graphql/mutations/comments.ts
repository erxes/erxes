import { Resolver } from 'erxes-api-shared/core-types';
import { IContext } from '~/connectionResolvers';
import {
  requireClientPortalId,
  getClientPortalUserId,
} from '@/cms/graphql/utils/clientPortal';
import {
  assertCmsDocumentAccess,
  hasCmsPermission,
} from '@/cms/utils/permissions';
import { assertCmsAccessByClientPortal } from '@/cms/utils/cms-access';
import { PostCommentStatus } from '@/cms/@types/comments';
import { CMS_POST_ACTIONS } from '~/meta/permissions';

interface PostCommentInput {
  postId: string;
  clientPortalId: string;
  content: string;
  parentId?: string | null;
}

interface AddCommentArgs {
  input: PostCommentInput;
}

interface UpdateCommentArgs {
  _id: string;
  content: string;
}

interface DeleteCommentArgs {
  _id: string;
}

interface ChangeCommentStatusArgs extends DeleteCommentArgs {
  status: PostCommentStatus;
}

const normalizeContent = (content: string): string => {
  const normalizedContent = content?.trim();

  if (!normalizedContent) {
    throw new Error('Comment content is required');
  }

  return normalizedContent;
};

const assertCommentParent = async ({
  context,
  parentId,
  postId,
  clientPortalId,
  approvedOnly = false,
}: {
  context: IContext;
  parentId?: string | null;
  postId: string;
  clientPortalId: string;
  approvedOnly?: boolean;
}): Promise<string | undefined> => {
  if (!parentId) {
    return undefined;
  }

  const parent = await context.models.PostComments.findOne({
    _id: parentId,
    postId,
    clientPortalId,
    ...(approvedOnly ? { status: 'approved' } : {}),
  })
    .select({ _id: 1 })
    .lean();

  if (!parent) {
    throw new Error('Parent comment not found');
  }

  return parentId;
};

const assertStaffPostAccess = async ({
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

  await assertCmsDocumentAccess({
    context,
    actions: action,
    document: post,
  });

  return post;
};

export const postCommentMutations: Record<string, Resolver> = {
  cmsPostCommentAdd: async (
    _parent: unknown,
    args: AddCommentArgs,
    context: IContext,
  ) => {
    const { models, user } = context;
    const { input } = args;
    const content = normalizeContent(input.content);

    if (!user?._id) {
      throw new Error('Login required');
    }

    await assertStaffPostAccess({
      context,
      postId: input.postId,
      clientPortalId: input.clientPortalId,
      action: CMS_POST_ACTIONS.update,
    });

    const cms = await models.CMS.findOne({
      clientPortalId: input.clientPortalId,
    })
      .select({ allowComments: 1 })
      .lean();

    if (!cms?.allowComments) {
      throw new Error('Comments are disabled for this site');
    }

    const parentId = await assertCommentParent({
      context,
      parentId: input.parentId,
      postId: input.postId,
      clientPortalId: input.clientPortalId,
    });

    return models.PostComments.createComment({
      postId: input.postId,
      clientPortalId: input.clientPortalId,
      content,
      parentId,
      authorKind: 'user',
      authorId: user._id,
      status: 'approved',
    });
  },

  cmsPostCommentUpdate: async (
    _parent: unknown,
    args: UpdateCommentArgs,
    context: IContext,
  ) => {
    const { models, user } = context;
    const { _id } = args;
    const content = normalizeContent(args.content);

    if (!user?._id) {
      throw new Error('Login required');
    }

    const comment = await models.PostComments.findOne({ _id }).lean();
    if (!comment) throw new Error('Comment not found');

    const ownsComment =
      comment.authorKind === 'user' && comment.authorId === user._id;
    const canModerate = await hasCmsPermission(context, CMS_POST_ACTIONS.remove);

    if (!ownsComment && !canModerate) {
      throw new Error('Not authorized to edit this comment');
    }

    await assertStaffPostAccess({
      context,
      postId: comment.postId,
      clientPortalId: comment.clientPortalId,
      action: ownsComment
        ? CMS_POST_ACTIONS.update
        : CMS_POST_ACTIONS.remove,
    });

    return models.PostComments.updateComment(_id, { content });
  },

  cmsPostCommentDelete: async (
    _parent: unknown,
    args: DeleteCommentArgs,
    context: IContext,
  ) => {
    const { models, user } = context;
    const { _id } = args;

    if (!user?._id) {
      throw new Error('Login required');
    }

    const comment = await models.PostComments.findOne({ _id }).lean();
    if (!comment) throw new Error('Comment not found');

    const ownsComment =
      comment.authorKind === 'user' && comment.authorId === user._id;
    const canRemoveAny = await hasCmsPermission(
      context,
      CMS_POST_ACTIONS.remove,
    );

    if (!ownsComment && !canRemoveAny) {
      throw new Error('Not authorized to delete this comment');
    }

    await assertStaffPostAccess({
      context,
      postId: comment.postId,
      clientPortalId: comment.clientPortalId,
      action: ownsComment
        ? CMS_POST_ACTIONS.update
        : CMS_POST_ACTIONS.remove,
    });

    return models.PostComments.deleteComment(_id);
  },

  cmsPostCommentChangeStatus: async (
    _parent: unknown,
    args: ChangeCommentStatusArgs,
    context: IContext,
  ) => {
    const { models } = context;
    const { _id, status } = args;
    const comment = await models.PostComments.findOne({ _id }).lean();

    if (!comment) {
      throw new Error('Comment not found');
    }

    await assertStaffPostAccess({
      context,
      postId: comment.postId,
      clientPortalId: comment.clientPortalId,
      action: CMS_POST_ACTIONS.approve,
    });

    return models.PostComments.findOneAndUpdate(
      { _id },
      { $set: { status } },
      { new: true },
    );
  },

  cpPostCommentAdd: async (
    _parent: unknown,
    args: AddCommentArgs,
    context: IContext,
  ) => {
    const { models } = context;
    const { input } = args;
    const clientPortalId = requireClientPortalId(context);
    const authorId = getClientPortalUserId(context);
    const content = normalizeContent(input.content);

    if (!authorId) throw new Error('Authentication required');

    const cms = await models.CMS.findOne({ clientPortalId }).lean();
    if (!cms?.allowComments) {
      throw new Error('Comments are disabled for this site');
    }

    const post = await models.Posts.findOne({
      _id: input.postId,
      clientPortalId,
      status: 'published',
    }).lean();
    if (!post) throw new Error('Published post not found');

    const parentId = await assertCommentParent({
      context,
      parentId: input.parentId,
      postId: input.postId,
      clientPortalId,
      approvedOnly: true,
    });

    return models.PostComments.createComment({
      postId: input.postId,
      clientPortalId,
      content,
      parentId,
      authorKind: 'portalUser',
      authorId,
      status: cms.autoApproveComments ? 'approved' : 'pending',
    });
  },

  cpPostCommentUpdate: async (
    _parent: unknown,
    args: UpdateCommentArgs,
    context: IContext,
  ) => {
    const { models } = context;
    const { _id } = args;
    const content = normalizeContent(args.content);
    const clientPortalId = requireClientPortalId(context);
    const authorId = getClientPortalUserId(context);

    if (!authorId) throw new Error('Authentication required');

    const comment = await models.PostComments.findOne({
      _id,
      clientPortalId,
      authorKind: 'portalUser',
    }).lean();
    if (!comment) throw new Error('Comment not found');
    if (comment.authorId !== authorId) {
      throw new Error('Not authorized to edit this comment');
    }

    const cms = await models.CMS.findOne({ clientPortalId })
      .select({ autoApproveComments: 1 })
      .lean();

    return models.PostComments.updateComment(_id, {
      content,
      status: cms?.autoApproveComments ? 'approved' : 'pending',
    });
  },

  cpPostCommentDelete: async (
    _parent: unknown,
    args: DeleteCommentArgs,
    context: IContext,
  ) => {
    const { models } = context;
    const { _id } = args;
    const clientPortalId = requireClientPortalId(context);
    const authorId = getClientPortalUserId(context);

    if (!authorId) throw new Error('Authentication required');

    const comment = await models.PostComments.findOne({
      _id,
      clientPortalId,
      authorKind: 'portalUser',
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
