import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { commentSchema } from '@/portal/db/definitions/comment';
import { IComment, ICommentDocument } from '@/portal/@types/comment';

export interface ICommentModel extends Model<ICommentDocument> {
  getComment(_id: string): Promise<ICommentDocument>;
  createComment(doc: IComment): Promise<ICommentDocument>;
  updateComment(_id: string, doc: IComment): Promise<ICommentDocument>;
  deleteComment(_id: string): void;
}

export const loadCommentClass = (models: IModels) => {
  class Comment {
    /**
     * Retreives comment
     */
    public static async getComment(_id: string) {
      const comment = await models.Comments.findOne({ _id });

      if (!comment) {
        throw new Error('Comment not found');
      }

      return comment;
    }

    public static async createComment(doc: IComment) {
      return models.Comments.create({
        ...doc,
        createdAt: new Date(),
      });
    }

    public static async deleteComment(_id: string) {
      return models.Comments.deleteOne({ _id });
    }

    public static async updateComment(_id: string, doc: IComment) {
      return models.Comments.findByIdAndUpdate(_id, doc, { new: true });
    }
  }

  commentSchema.loadClass(Comment);

  return commentSchema;
};
