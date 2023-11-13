import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';

import {
  IStoredInterest,
  IStoredInterestDocument,
  storedInterestSchema
} from './definitions/storedInterest';
import { getDiffDay, getFullDate } from './utils/utils';
import { IContractDocument } from './definitions/contracts';
import { CONTRACT_STATUS } from './definitions/constants';

export const loanStoredInterestClass = (models: IModels) => {
  class StoredInterest {
    public static async createStoredInterest(
      payDate: Date,
      periodLockId: string
    ) {
      const storeInterestDate = getFullDate(payDate);

      const contracts: (IContractDocument & {
        balanceAmount: number;
      })[] = await models.Contracts.find({
        lastStoredDate: { $lt: storeInterestDate },
        status: CONTRACT_STATUS.NORMAL
      }).lean();

      if (contracts.length > 0) {
        for (const contract of contracts) {
          const prevSchedule = await models.Schedules.findOne({
            contractId: contract._id,
            payDate: { $lte: storeInterestDate },
            'transactionIds.0': { $exists: true }
          }).sort({ payDate: -1 });

          if (!prevSchedule) contract.balanceAmount = contract.leaseAmount;
          else contract.balanceAmount = prevSchedule?.balance || 0;

          let storedInterest = Number(
            (
              ((contract.balanceAmount * contract.interestRate) / 100 / 365) *
              getDiffDay(contract.lastStoredDate, storeInterestDate)
            ).toFixed(0)
          );

          await models.StoredInterest.create({
            amount: storedInterest,
            contractId: contract._id,
            invDate: storeInterestDate,
            prevStoredDate: contract.lastStoredDate,
            periodLockId,
            number: contract.number
          });

          await models.Contracts.updateOne(
            { _id: contract._id },
            {
              $inc: { storedInterest: storedInterest },
              $set: {
                lastStoredDate: storeInterestDate
              }
            }
          );
        }
      }

      //var res = await models.StoredInterest.create(storedInterest);

      return {};
    }

    public static async getStoredInterest(_id: string) {
      var res = await models.StoredInterest.findOne({ _id }).lean();

      return res;
    }

    public static async updateStoredInterest(
      _id: string,
      storedInterest: IStoredInterest
    ) {
      var res = await models.StoredInterest.updateOne(
        { _id },
        { $set: storedInterest }
      );

      return res;
    }
  }
  storedInterestSchema.loadClass(StoredInterest);
  return storedInterestSchema;
};

export interface IStoredInterestModel extends Model<IStoredInterestDocument> {
  createStoredInterest(payDate: Date, periodLockId: string);
  getStoredInterest(_id: string);
  updateStoredInterest(_id, storedInterest: IStoredInterest);
}
