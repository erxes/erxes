import { Model } from 'mongoose';

import { IModels } from '../connectionResolver';
import { commentSchema, ICommentDocument } from './definitions/comments';

export interface ICommentModel extends Model<ICommentDocument> {
  getComment(selector: any): Promise<ICommentDocument>;
}

export const loadCommentClass = (models: IModels) => {
  class Comment {
    public static async getComment(selector: any) {
      const comment = await models.Comments.findOne(selector);

      if (!comment) {
        throw new Error('Comment not found');
      }

      return comment;
    }
  }

  commentSchema.loadClass(Comment);

  return commentSchema;
};
