import { Model } from 'mongoose';
import {
  IFxaInstanceLog,
  IFxaInstanceLogDocument,
} from '../../@types/fxaInstanceLog';
import { fxaInstanceLogSchema } from '../definitions/fxaInstanceLog';

export interface IFxaInstanceLogModel extends Model<IFxaInstanceLogDocument> {
  hasBlockingUsage(
    instanceIds: string[],
    allowedEventType: string,
  ): Promise<boolean>;
  deleteForInstances(instanceIds: string[]): Promise<void>;
  deleteByTransaction(transactionId: string, eventType?: string): Promise<void>;
  findByTransaction(
    transactionId: string,
    eventType: string | string[],
  ): Promise<IFxaInstanceLogDocument[]>;
  createLog(doc: IFxaInstanceLog): Promise<IFxaInstanceLogDocument>;
}

export const loadFxaInstanceLogClass = () => {
  class FxaInstanceLog {
    public static async hasBlockingUsage(
      this: IFxaInstanceLogModel,
      instanceIds: string[],
      allowedEventType: string,
    ) {
      if (!instanceIds.length) {
        return false;
      }

      const blockingLog = await this.findOne({
        fxaInstanceId: { $in: instanceIds },
        eventType: { $ne: allowedEventType },
      }).lean();

      return !!blockingLog;
    }

    public static async deleteForInstances(
      this: IFxaInstanceLogModel,
      instanceIds: string[],
    ) {
      if (!instanceIds.length) {
        return;
      }

      await this.deleteMany({ fxaInstanceId: { $in: instanceIds } });
    }

    public static async deleteByTransaction(
      this: IFxaInstanceLogModel,
      transactionId: string,
      eventType?: string,
    ) {
      const selector: Record<string, unknown> = { transactionId };

      if (eventType) {
        selector.eventType = eventType;
      }

      await this.deleteMany(selector);
    }

    public static async findByTransaction(
      this: IFxaInstanceLogModel,
      transactionId: string,
      eventType: string | string[],
    ) {
      return this.find({
        transactionId,
        eventType: Array.isArray(eventType) ? { $in: eventType } : eventType,
      }).lean();
    }

    public static async createLog(
      this: IFxaInstanceLogModel,
      doc: IFxaInstanceLog,
    ) {
      return this.create(doc);
    }
  }

  fxaInstanceLogSchema.loadClass(FxaInstanceLog);

  return fxaInstanceLogSchema;
};
