import { IUserDocument } from '@erxes/api-utils/src/types';
import { Document, Schema, Model, Connection, Types } from 'mongoose';
import { UserTypes, USER_TYPES } from '../../consts';
import { IModels } from './index';

export interface IComment {
  _id: any;
  replyToId?: string;
  postId: string;
  content: string;

  createdUserType: UserTypes;
  createdAt: Date;
  createdById?: string;
  createdByCpId?: string;

  updatedUserType: UserTypes;
  updatedAt: Date;
  updatedById?: string;
  updatedByCpId?: string;
}

export type CommentDocument = IComment & Document;
export interface ICommentModel extends Model<CommentDocument> {
  findByIdOrThrow(_id: string): Promise<CommentDocument>;
  createComment(
    c: Omit<IComment, '_id'>,
    user: IUserDocument
  ): Promise<CommentDocument>;
  updateComment(
    _id: string,
    content: string,
    user: IUserDocument
  ): Promise<CommentDocument>;
  deleteComment(_id: string): Promise<CommentDocument>;
}

export const commentSchema = new Schema<CommentDocument>(
  {
    replyToId: { type: Types.ObjectId, index: true },
    postId: { type: Types.ObjectId, index: true },
    content: { type: String, required: true },

    createdUserType: { type: String, required: true, enum: USER_TYPES },
    createdById: String,
    createdByCpId: String,

    updatedUserType: { type: String, required: true, enum: USER_TYPES },
    updatedById: String,
    updatedByCpId: String
  },
  {
    timestamps: true
  }
);

export const generateCommentModel = (
  subdomain: string,
  con: Connection,
  models: IModels
): void => {
  class CommentModel {
    public static async findByIdOrThrow(_id: string): Promise<CommentDocument> {
      const comment = await models.Comment.findById(_id);
      if (!comment) {
        throw new Error(`Comment with \`{ "_id" : "${_id}"}\` doesn't exist`);
      }
      return comment;
    }
    public static async createComment(
      c: Omit<IComment, '_id'>,
      user: IUserDocument
    ): Promise<CommentDocument> {
      const res = await models.Comment.create({
        ...c,
        createdById: user._id,
        createdUserType: USER_TYPES[0],
        updatedById: user._id,
        updatedUserType: USER_TYPES[0]
      });
      await models.Post.incCommentCount(c.postId, 1);
      return res;
    }
    public static async updateComment(
      _id: string,
      content: string,
      user: IUserDocument
    ): Promise<CommentDocument> {
      const comment = await models.Comment.findByIdOrThrow(_id);
      comment.content = content;
      comment.updatedUserType = USER_TYPES[0];
      comment.updatedById = user._id;
      await comment.save();
      return comment;
    }

    public static async deleteComment(_id: string): Promise<CommentDocument> {
      const deletedComment = await models.Comment.findByIdOrThrow(_id);

      const idsToDelete = [_id];
      let findReplies = [_id];

      while (findReplies?.length) {
        const replies = await models.Comment.find({
          replyToId: { $in: findReplies }
        }).lean();
        const replyIds = replies.map(reply => reply._id);
        idsToDelete.push(...replyIds);
        findReplies = replyIds;
      }

      const res = await models.Comment.deleteMany({
        _id: { $in: idsToDelete }
      });
      await models.Post.incCommentCount(
        deletedComment.postId,
        -1 * (res.deletedCount || 0)
      );

      return deletedComment;
    }
  }
  commentSchema.loadClass(CommentModel);

  models.Comment = con.model<CommentDocument, ICommentModel>(
    'forum_comments',
    commentSchema
  );
};
