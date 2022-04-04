import { EmojiDoc } from '../graphql/resolvers/mutations/emojis';
import { Model } from 'mongoose';
import {
  commentSchema,
  emojiSchema,
  ICommentDocument,
  IEmojiDocument
} from './definitions/reaction';

export interface ICommentModel extends Model<ICommentDocument> {
  getComment(doc: any): ICommentDocument;
  createComment(doc: any, user: any): ICommentDocument;
  updateComment(_id: string, doc: any, user: any): ICommentDocument;
  removeComment(_id: string): ICommentDocument;
}

export const loadCommentClass = models => {
  class Comment {
    /*
     * Create new comment
     */
    public static async getComment(doc: any) {
      const commentObj = await models.Comments.findOne(doc);

      if (!commentObj) {
        throw new Error('Comment not found');
      }

      return commentObj;
    }

    /*
     * Create new comment
     */
    public static async createComment(doc: any, user: any) {
      const comment = await models.Comments.create({
        createdBy: user._id,
        createdAt: new Date(),
        ...doc
      });

      return comment;
    }

    /*
     * Update comment
     */
    public static async updateComment(_id: string, doc: any, user: any) {
      await models.Comments.updateOne(
        { _id },
        {
          $set: {
            updatedBy: user._id,
            updatedAt: new Date(),
            ...doc
          }
        }
      );

      return models.Comments.findOne({ _id });
    }

    /*
     * Remove comment
     */
    public static async removeComment(_id: string) {
      return models.Comments.deleteOne({ _id });
    }
  }

  commentSchema.loadClass(Comment);

  return commentSchema;
};
export interface IEmojiModel extends Model<IEmojiDocument> {
  createEmoji(doc: EmojiDoc): IEmojiDocument;
  removeEmoji(doc: EmojiDoc): IEmojiDocument;
}

export const loadEmojiClass = models => {
  class Emoji {
    /*
     * Create new emoji
     */
    public static async createEmoji(doc: EmojiDoc) {
      return models.Emojis.create({
        createdAt: new Date(),
        ...doc
      });
    }

    /*
     * Remove exm
     */
    public static async removeEmoji(doc: EmojiDoc) {
      return models.Emojis.deleteOne(doc);
    }
  }
  emojiSchema.loadClass(Emoji);

  return emojiSchema;
};
