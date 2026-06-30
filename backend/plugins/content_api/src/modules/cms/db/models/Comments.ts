import { IModels } from '~/connectionResolvers';
import {
  IPostComment,
  IPostCommentDocument,
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
      content: string,
    ): Promise<IPostCommentDocument> => {
      const comment = await models.PostComments.findOneAndUpdate(
        { _id },
        { $set: { content } },
        { new: true },
      );
      if (!comment) throw new Error('Comment not found');
      return comment;
    };

    public static readonly deleteComment = async (
      _id: string,
    ): Promise<{ deletedCount?: number }> =>
      models.PostComments.deleteOne({ _id });
  }

  postCommentSchema.loadClass(PostComments);
  return postCommentSchema;
};
