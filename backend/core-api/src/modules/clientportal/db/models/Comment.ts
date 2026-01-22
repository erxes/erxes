import { Model } from 'mongoose';
import { ICPComment, ICPCommentDocument } from '../../types/comment';
import { IModels } from '~/connectionResolvers';
import { commentSchema } from 'erxes-api-shared/core-modules';


export interface ICPCommentsModel extends Model<ICPCommentDocument> {
  getComment(_id: string): Promise<ICPCommentDocument>;
  createComment(doc: ICPComment): Promise<ICPCommentDocument>;
  updateComment(_id: string, doc: Partial<ICPComment>): Promise<ICPCommentDocument>;
  deleteComment(_id: string): void;
}

export const loadCommentClass = (models: IModels) => {
  class Comment {
    /**
     * Retreives comment
     */
    public static async getComment(_id: string) {
      const comment = await models.CPComments.findOne({ _id });

      if (!comment) {
        throw new Error('Comment not found');
      }

      return comment;
    }

    public static async createComment(doc: ICPCommentDocument) {
      return models.CPComments.create({
        ...doc,
        createdAt: new Date()
      });
    }

    public static async updateComment(_id: string, doc: Partial<ICPComment>) {
      const comment = await models.CPComments.findOneAndUpdate(
        { _id },
        { $set: { ...doc, updatedAt: new Date() } },
        { new: true }
      );

      if (!comment) {
        throw new Error('Comment not found');
      }

      return comment;
    }

    public static async deleteComment(_id: string) {
      return models.CPComments.deleteOne({ _id });
    }
  }

  commentSchema.loadClass(Comment);

  return commentSchema;
};
