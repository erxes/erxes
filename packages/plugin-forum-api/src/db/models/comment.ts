import { IUserDocument } from '@erxes/api-utils/src/types';
import { Document, Schema, Model, Connection, Types } from 'mongoose';
import { cpus } from 'os';
import { UserTypes, USER_TYPES } from '../../consts';
import { ICpUser } from '../../graphql';
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

const OMIT_FROM_INPUT = [
  '_id',
  'createdUserType',
  'createdAt',
  'createdById',
  'createdByCpId',
  'updatedUserType',
  'updatedAt',
  'updatedById',
  'updatedByCpId'
] as const;

type CommentCreateInput = Omit<IComment, typeof OMIT_FROM_INPUT[number]>;

export type CommentDocument = IComment & Document;
export interface ICommentModel extends Model<CommentDocument> {
  findByIdOrThrow(_id: string): Promise<CommentDocument>;
  createComment(
    c: CommentCreateInput,
    user: IUserDocument
  ): Promise<CommentDocument>;
  updateComment(
    _id: string,
    content: string,
    user: IUserDocument
  ): Promise<CommentDocument>;
  deleteComment(_id: string): Promise<CommentDocument>;

  /* <<< Client portal */
  findByIdOrThrowCp(_id: string, cpUser: ICpUser): Promise<CommentDocument>;
  createCommentCp(
    c: CommentCreateInput,
    cpUser?: ICpUser
  ): Promise<CommentDocument>;
  updateCommentCp(
    _id: string,
    content: string,
    cpUser?: ICpUser
  ): Promise<CommentDocument>;
  deleteCommentCp(_id: string, cpUser?: ICpUser): Promise<CommentDocument>;
  /* >>> Client portal */
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

    /* <<< Client portal */
    public static async findByIdOrThrowCp(
      _id: string,
      cpUser: ICpUser
    ): Promise<CommentDocument> {
      const comment = await models.Comment.findByIdOrThrow(_id);
      if (comment.createdByCpId !== cpUser.userId)
        throw new Error(`This comment doesn't belong to the current user`);
      return comment;
    }
    public static async createCommentCp(
      c: Omit<IComment, '_id'>,
      cpUser?: ICpUser
    ): Promise<CommentDocument> {
      if (!cpUser) throw new Error('Unauthorized');

      const res = await models.Comment.create({
        ...c,
        createdByCpId: cpUser.userId,
        createdUserType: USER_TYPES[1],
        updatedByCpId: cpUser.userId,
        updatedUserType: USER_TYPES[1]
      });

      await models.Post.incCommentCount(c.postId, 1);
      return res;
    }
    public static async updateCommentCp(
      _id: string,
      content: string,
      cpUser?: ICpUser
    ): Promise<CommentDocument> {
      if (!cpUser) throw new Error('Unauthorized');

      const comment = await models.Comment.findByIdOrThrowCp(_id, cpUser);
      comment.content = content;
      comment.updatedUserType = USER_TYPES[1];
      comment.updatedByCpId = cpUser.userId;
      await comment.save();
      return comment;
    }

    public static async deleteCommentCp(
      _id: string,
      cpUser?: ICpUser
    ): Promise<CommentDocument> {
      if (!cpUser) throw new Error('Unauthorized');

      const deletedComment = await models.Comment.findByIdOrThrowCp(
        _id,
        cpUser
      );

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
    /* >>> Client portal */
  }
  commentSchema.loadClass(CommentModel);

  models.Comment = con.model<CommentDocument, ICommentModel>(
    'forum_comments',
    commentSchema
  );
};
