import {
  EMAIL_RAMP_ID,
  emailRampSchema,
  IEmailRampDocument,
} from 'erxes-api-shared/core-modules';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';

export interface IEmailRampModel extends Model<IEmailRampDocument> {
  current(): Promise<IEmailRampDocument | null>;
  consume(count: number, limit: number): Promise<boolean>;
  recordEvaluation(patch: Record<string, unknown>): Promise<void>;
  halt(reason: string): Promise<void>;
  release(userId?: string, note?: string): Promise<void>;
}

const today = () => new Date().toISOString().slice(0, 10);

export const loadEmailRampClass = (models: IModels) => {
  class EmailRamp {
    public static async current() {
      const day = today();

      await models.EmailRamp.updateOne(
        { _id: EMAIL_RAMP_ID },
        { $setOnInsert: { createdAt: new Date() } },
        { upsert: true },
      );

      await models.EmailRamp.updateOne(
        { _id: EMAIL_RAMP_ID, day: { $ne: day } },
        { $set: { day, usedToday: 0, updatedAt: new Date() } },
      );

      return await models.EmailRamp.findOne({ _id: EMAIL_RAMP_ID });
    }

    public static async consume(count: number, limit: number) {
      const result = await models.EmailRamp.updateOne(
        { _id: EMAIL_RAMP_ID, usedToday: { $lte: limit - count } },
        { $inc: { usedToday: count }, $set: { updatedAt: new Date() } },
      );

      return result.modifiedCount > 0;
    }

    public static async recordEvaluation(patch: Record<string, unknown>) {
      await models.EmailRamp.updateOne(
        { _id: EMAIL_RAMP_ID },
        { $set: { ...patch, updatedAt: new Date() } },
      );
    }

    public static async halt(reason: string) {
      await models.EmailRamp.updateOne(
        { _id: EMAIL_RAMP_ID },
        {
          $set: {
            haltedAt: new Date(),
            haltReason: reason,
            updatedAt: new Date(),
          },
        },
      );
    }

    public static async release(userId?: string, note?: string) {
      await models.EmailRamp.updateOne(
        { _id: EMAIL_RAMP_ID },
        {
          $unset: { haltedAt: '', haltReason: '' },
          $set: {
            releasedAt: new Date(),
            releasedBy: userId,
            releaseNote: note,
            lastEvaluatedAt: new Date(0),
            updatedAt: new Date(),
          },
        },
      );
    }
  }

  emailRampSchema.loadClass(EmailRamp);

  return emailRampSchema;
};
