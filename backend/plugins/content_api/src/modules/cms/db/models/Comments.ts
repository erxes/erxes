import { IModels } from '~/connectionResolvers';
import {
  IPostComment,
  IPostCommentDocument,
  IPostCommentUpdate,
} from '@/cms/@types/comments';
import { postCommentSchema } from '@/cms/db/definitions/comments';

export { IPostCommentModel } from '@/cms/@types/comments';

export const loadPostCommentClass = (models: IModels) => {
  class PostComments {
    public static readonly createComment = async (
      doc: IPostComment,
    ): Promise<IPostCommentDocument> => models.PostComments.create(doc);

    public static readonly updateComment = async (
      _id: string,
      update: IPostCommentUpdate,
    ): Promise<IPostCommentDocument> => {
      const comment = await models.PostComments.findOneAndUpdate(
        { _id },
        { $set: update },
        { new: true },
      );
      if (!comment) throw new Error('Comment not found');
      return comment;
    };

    public static readonly deleteComment = async (
      _id: string,
    ): Promise<{ deletedCount?: number }> => {
      const root = await models.PostComments.findOne({ _id })
        .select({ _id: 1, postId: 1, clientPortalId: 1 })
        .lean();

      if (!root) {
        return { deletedCount: 0 };
      }

      const commentIds = new Set<string>([String(root._id)]);
      let parentIds = [String(root._id)];

      while (parentIds.length > 0) {
        const childIds = await models.PostComments.distinct('_id', {
          parentId: { $in: parentIds },
          postId: root.postId,
          clientPortalId: root.clientPortalId,
        });

        parentIds = childIds
          .map(String)
          .filter((commentId) => !commentIds.has(commentId));
        parentIds.forEach((commentId) => commentIds.add(commentId));
      }

      return models.PostComments.deleteMany({
        _id: { $in: Array.from(commentIds) },
      });
    };
  }

  postCommentSchema.loadClass(PostComments);
  return postCommentSchema;
};
