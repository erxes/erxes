import { Document, Schema, Model, Connection, Types, model } from 'mongoose';
import { IModels } from './index';

export interface IComment {
  _id: any;
  replyToId: string;
  content: string;
}

export type CommentDocument = IComment & Document;
export interface ICommentModel extends Model<CommentDocument> {
  createComment(c: Omit<IComment, '_id'>): Promise<CommentDocument>;
  updateComment(_id: string, content: string): Promise<CommentDocument>;
  deleteComments(_id: string[]): Promise<void>;
}

export const commentSchema = new Schema<CommentDocument>({
  replyToId: { type: Types.ObjectId, index: true },
  content: String
});

export const generateCommentModel = (
  subdomain: string,
  con: Connection,
  models: IModels
): void => {
  class CommentModel {
    public static async createComment(
      c: Omit<IComment, '_id'>
    ): Promise<CommentDocument> {
      const res = await models.Comment.create(c);
      return res;
    }
    public static async updateComment(
      _id: string,
      content: string
    ): Promise<CommentDocument> {
      const comment = await models.Comment.findById(_id);
      if (!comment) {
        throw new Error(`Comment with \`{ "_id" : "${_id}"}\` doesn't exist`);
      }
      comment.content = content;
      comment.save;
      return comment;
    }

    public static async deleteComments(ids: string[]): Promise<void> {
      const idsToDelete = ids;
      let findRepliesOf = ids;

      while (findRepliesOf?.length) {
        const replies = await models.Comment.find({
          replyToId: { $in: findRepliesOf }
        }).lean();
        const replyIds = replies.map(reply => reply._id);
        idsToDelete.push(...replyIds);
        findRepliesOf = replyIds;
      }

      await models.Comment.deleteMany({ _id: { $in: idsToDelete } });
    }
  }
  commentSchema.loadClass(CommentModel);

  models.Comment = con.model<CommentDocument, ICommentModel>(
    'forum_categories',
    commentSchema
  );
};
