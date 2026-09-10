import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import {
  facebookCommentOutboxSchema,
  IFacebookCommentOutboxDocument,
} from '../definitions/comment_outbox';

export interface IFacebookCommentOutboxModel extends Model<IFacebookCommentOutboxDocument> {
  markSent(_id: string): Promise<void>;
  markFailed(_id: string, error: string): Promise<void>;
  markRequeued(_id: string, sendAfter: Date): Promise<void>;
}

export const loadFacebookCommentOutboxClass = (models: IModels) => {
  class FacebookCommentOutbox {
    public static async markSent(_id: string) {
      await models.FacebookCommentOutbox.updateOne(
        { _id },
        { $set: { status: 'sent', sentAt: new Date() } },
      );
    }

    public static async markFailed(_id: string, error: string) {
      await models.FacebookCommentOutbox.updateOne(
        { _id },
        { $set: { status: 'failed', error } },
      );
    }

    /** Stays pending: the row is waiting out a block, not finished with. */
    public static async markRequeued(_id: string, sendAfter: Date) {
      await models.FacebookCommentOutbox.updateOne(
        { _id },
        { $set: { sendAfter }, $inc: { attempts: 1 } },
      );
    }
  }

  facebookCommentOutboxSchema.loadClass(FacebookCommentOutbox);

  return facebookCommentOutboxSchema;
};
