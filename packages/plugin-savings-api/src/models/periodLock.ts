import {
  IPeriodLock,
  IPeriodLockDocument,
  periodLockSchema
} from './definitions/periodLocks';
import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import { FilterQuery } from 'mongodb';
import { IStoredInterestDocument } from './definitions/storedInterest';
import { getDaysInMonth, getDiffDay, getFullDate } from './utils/utils';
import {
  CONTRACT_STATUS,
  STORE_INTEREST_INTERVAL
} from './definitions/constants';
import storeInterest from './utils/storeInterestUtils';

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
    public static async createPeriodLock(doc: IPeriodLock, subdomain: string) {
      const nextLock = await models.PeriodLocks.findOne({
        date: { $gte: doc.date }
      })
        .sort({ date: -1 })
        .lean();
      if (!!nextLock)
        throw new Error(
          `Can't lock period at this time because already locked`
        );

      const periodLocks = await models.PeriodLocks.create(doc);

      const nowDate = getFullDate(doc.date);

      const contracts = await models.Contracts.find({
        status: CONTRACT_STATUS.NORMAL,
        interestRate: { $gt: 0 }
      }).lean();

      for await (let contract of contracts) {
        const lastStoredDate = getFullDate(contract.lastStoredDate);

        const diffDay = getDiffDay(lastStoredDate, nowDate);

        if (diffDay > 0) await storeInterest(contract, models, nowDate);
      }
      return periodLocks;
    }

    /**
     * Update PeriodLock
     */
    public static async updatePeriodLock(
      _id: string,
      doc: IPeriodLock,
      subdomain: string
    ) {
      await models.PeriodLocks.updateOne({ _id }, { $set: doc });

      const prevLock = await models.PeriodLocks.findOne({
        date: { $lt: doc.date }
      }).sort({ date: -1 });

      const transactions = await models.Transactions.find({
        payDate: {
          $lte: doc.date,
          ...(prevLock?.date ? { $gt: prevLock?.date } : {})
        },
        contractId: { $nin: doc.excludeContracts || [], $exists: true }
      });

      return models.PeriodLocks.findOne({ _id });
    }

    /**
     * Remove PeriodLock
     */
    public static async removePeriodLocks(_ids: string[]) {
      const storedInterestList: IStoredInterestDocument[] = await models.StoredInterest.find(
        { periodLockId: { $in: _ids } }
      ).lean();
      for (const storedInterst of storedInterestList) {
        await models.Contracts.updateOne(
          { _id: storedInterst.contractId },
          {
            $set: {
              storedInterst: { $inc: storedInterst.amount * -1 },
              lastStoredDate: storedInterst.prevStoredDate
            }
          }
        );
      }

      await models.StoredInterest.deleteMany({
        _id: storedInterestList.map(a => a._id)
      });
      return models.PeriodLocks.deleteMany({ _id: { $in: _ids } });
    }
  }
  periodLockSchema.loadClass(PeriodLock);
  return periodLockSchema;
};

export interface IPeriodLockModel extends Model<IPeriodLockDocument> {
  getPeriodLock(selector: FilterQuery<IPeriodLockDocument>);
  createPeriodLock(doc: IPeriodLock, subdomain: string);
  updatePeriodLock(_id: string, doc: IPeriodLock, subdomain: string);
  removePeriodLocks(_ids: string[]);
}
