import { IContext } from '~/connectionResolvers';
import { Resolver } from 'erxes-api-shared/core-types';
import { markResolvers } from 'erxes-api-shared/utils';
import { ICPComment } from '@/clientportal/types/comment';
import { AuthenticationError } from '@/clientportal/services/errorHandler';

interface CreateCommentParams {
  comment: {
    typeId: string;
    type: string;
    content: string;
    parentId?: string;
  };
}

interface UpdateCommentParams {
  _id: string;
  comment: {
    content?: string;
    parentId?: string;
  };
}

interface DeleteCommentParams {
  _id: string;
}

export const commentMutations: Record<string, Resolver> = {
  async clientPortalCommentAdd(
    _root: unknown,
    { comment }: CreateCommentParams,
    { models, user, cpUser }: IContext,
  ) {
    // Support both team-member users and CPUsers
    if (!user && !cpUser) {
      throw new AuthenticationError('User not authenticated');
    }

    // Determine user ID and type based on which user is authenticated
    const userId = user?._id || cpUser?._id;
    const userType = user ? 'team' : 'client';

    // Always use the authenticated user's ID and type for security
    const commentDoc: ICPComment = {
      typeId: comment.typeId,
      type: comment.type,
      content: comment.content,
      parentId: comment.parentId,
      userId,
      userType,
    };

    return models.CPComments.createComment(commentDoc);
  },

  async clientPortalCommentUpdate(
    _root: unknown,
    { _id, comment }: UpdateCommentParams,
    { models, user, cpUser }: IContext,
  ) {
    // Support both team-member users and CPUsers
    if (!user && !cpUser) {
      throw new AuthenticationError('User not authenticated');
    }

    const existingComment = await models.CPComments.getComment(_id);
    const userId = user?._id || cpUser?._id;

    // Only the comment owner can update
    if (existingComment.userId !== userId) {
      throw new AuthenticationError('Not authorized to update this comment');
    }

    return models.CPComments.updateComment(_id, comment as Partial<ICPComment>);
  },

  async clientPortalCommentDelete(
    _root: unknown,
    { _id }: DeleteCommentParams,
    { models, user, cpUser }: IContext,
  ) {
    // Support both team-member users and CPUsers
    if (!user && !cpUser) {
      throw new AuthenticationError('User not authenticated');
    }

    const existingComment = await models.CPComments.getComment(_id);
    const userId = user?._id || cpUser?._id;

    // Only the comment owner can delete
    if (existingComment.userId !== userId) {
      throw new AuthenticationError('Not authorized to delete this comment');
    }

    await models.CPComments.deleteComment(_id);

    return { success: true };
  },
};

markResolvers(commentMutations, {
  wrapperConfig: {
    skipPermission: true, // Skip permission checks, authentication handled in resolvers
  },
});
