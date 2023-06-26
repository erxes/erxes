import {
  IPeriodLock,
  IPeriodLockDocument,
  periodLockSchema
} from './definitions/periodLocks';
import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import { FilterQuery } from 'mongodb';
import { sendMessageBroker } from '../messageBroker';

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
      const prevLock = await models.PeriodLocks.findOne().sort({ date: 1 });
      const transactions = await models.Transactions.find({
        payDate: {
          $lte: periodLocks.date,
          ...(prevLock?.date ? { $gte: prevLock?.date } : {})
        },
        contractId: { $nin: doc.excludeContracts || [] }
      });

      const generals = await models.General.createGeneral(
        transactions,
        periodLocks._id
      );

      await sendMessageBroker(
        {
          action: 'loanTransaction',
          subdomain,
          data: { generals, orderId: periodLocks._id, config: {} },
          isRPC: true
        },
        'syncerkhet'
      );

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
      }).sort({ date: 1 });

      const transactions = await models.Transactions.find({
        payDate: {
          $lte: doc.date,
          ...(prevLock?.date ? { $gte: prevLock?.date } : {})
        },
        contractId: { $nin: doc.excludeContracts || [] }
      });

      await models.General.deleteMany({ periodLockId: _id });
      const generals = await models.General.createGeneral(transactions, _id);

      await sendMessageBroker(
        {
          action: 'loanTransaction',
          subdomain,
          data: { generals, orderId: _id, config: {} },
          isRPC: true
        },
        'syncerkhet'
      );

      return models.PeriodLocks.findOne({ _id });
    }

    /**
     * Remove PeriodLock
     */
    public static async removePeriodLocks(_ids: string[]) {
      await models.General.deleteMany({ periodLockId: { $in: _ids } });
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
