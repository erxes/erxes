import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import {
  facebookCommentOutboxSchema,
  IFacebookCommentOutboxDocument,
} from '../definitions/comment_outbox';

export interface IFacebookCommentOutboxModel extends Model<IFacebookCommentOutboxDocument> {
  markSent(_id: string): Promise<void>;
  markFailed(_id: string, error: string): Promise<void>;
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
  }

  facebookCommentOutboxSchema.loadClass(FacebookCommentOutbox);

  return facebookCommentOutboxSchema;
};
