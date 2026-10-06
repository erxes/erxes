import { broadcastReachedSchema } from '@/broadcast/db/definitions/broadcastReached';
import { Document, Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';

export interface IBroadcastReached {
  engageMessageId: string;
  customerId: string;
  firstReachedAt: Date;
}

export interface IBroadcastReachedDocument
  extends IBroadcastReached,
    Document {
  _id: string;
}

export interface IBroadcastReachedModel
  extends Model<IBroadcastReachedDocument> {
  remember(engageMessageId: string, customerId: string): Promise<void>;
  wasReached(engageMessageId: string, customerId: string): Promise<boolean>;
}

export const loadBroadcastReachedClass = (models: IModels) => {
  class BroadcastReached {
    // After the send, never before: a failed attempt must leave no mark.
    public static async remember(
      engageMessageId: string,
      customerId: string,
    ) {
      await models.BroadcastReached.updateOne(
        { engageMessageId, customerId },
        { $setOnInsert: { firstReachedAt: new Date() } },
        { upsert: true },
      );
    }

    // The current attempt is not written until it succeeds, so it cannot find
    // itself here.
    public static async wasReached(
      engageMessageId: string,
      customerId: string,
    ) {
      return !!(await models.BroadcastReached.exists({
        engageMessageId,
        customerId,
      }));
    }
  }

  broadcastReachedSchema.loadClass(BroadcastReached);

  return broadcastReachedSchema;
};
