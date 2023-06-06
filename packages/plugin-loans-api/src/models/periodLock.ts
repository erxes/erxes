import {
  IPeriodLock,
  IPeriodLockDocument,
  periodLockSchema
} from './definitions/periodLocks';
import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import { FilterQuery } from 'mongodb';

export const loadPeriodLockClass = (models: IModels) => {
  class PeriodLock {
    /**
     *
     * Get PeriodLock
     */

    public static async getPeriodLock(selector: FilterQuery<IPeriodLock>) {
      const periodLock = await models.PeriodLocks.findOne(selector);

      if (!periodLock) {
        throw new Error('PeriodLock not found');
      }

      return periodLock;
    }

    /**
     * Create a periodLock
     */
    public static async createPeriodLock(doc: IPeriodLock) {
      const nextLock = await models.PeriodLocks.findOne({
        date: { $gte: doc.date }
      })
        .sort({ date: -1 })
        .lean();
      if (!!nextLock)
        throw new Error(
          `Can't lock period at this time because already locked`
        );
      return models.PeriodLocks.create(doc);
    }

    /**
     * Update PeriodLock
     */
    public static async updatePeriodLock(_id: string, doc: IPeriodLock) {
      await models.PeriodLocks.updateOne({ _id }, { $set: doc });

      return models.PeriodLocks.findOne({ _id });
    }

    /**
     * Remove PeriodLock
     */
    public static async removePeriodLocks(_ids: string[]) {
      return models.PeriodLocks.deleteMany({ _id: { $in: _ids } });
    }
  }
  periodLockSchema.loadClass(PeriodLock);
  return periodLockSchema;
};

export interface IPeriodLockModel extends Model<IPeriodLockDocument> {
  getPeriodLock(selector: FilterQuery<IPeriodLockDocument>);
  createPeriodLock(doc: IPeriodLock);
  updatePeriodLock(_id: string, doc: IPeriodLock);
  removePeriodLocks(_ids: string[]);
}
