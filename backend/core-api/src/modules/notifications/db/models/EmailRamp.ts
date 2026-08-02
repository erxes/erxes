import {
  EMAIL_RAMP_ID,
  emailRampSchema,
  IEmailRampDocument,
} from 'erxes-api-shared/core-modules';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';

export interface IEmailRampModel extends Model<IEmailRampDocument> {
  current(): Promise<IEmailRampDocument | null>;
  consume(count: number): Promise<void>;
  recordEvaluation(patch: Record<string, unknown>): Promise<void>;
  halt(reason: string): Promise<void>;
  release(userId?: string, note?: string): Promise<void>;
}

const today = () => new Date().toISOString().slice(0, 10);

export const loadEmailRampClass = (models: IModels) => {
  class EmailRamp {
    /** Created on first use, with today's allowance reset if the day rolled over. */
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

    public static async consume(count: number) {
      await models.EmailRamp.updateOne(
        { _id: EMAIL_RAMP_ID },
        { $inc: { usedToday: count }, $set: { updatedAt: new Date() } },
      );
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

    /**
     * `lastEvaluatedAt` is pushed back so the next read measures again rather
     * than trusting the reading that tripped the breaker.
     */
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
