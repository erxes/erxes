import { Model } from "mongoose";
import { IModels } from "../connectionResolver";

import {
  IStoredInterest,
  IStoredInterestDocument,
  storedInterestSchema
} from "./definitions/storedInterest";
import { calcInterest, getDiffDay, getFullDate } from "./utils/utils";
import { IContractDocument } from "./definitions/contracts";
import { CONTRACT_STATUS } from "./definitions/constants";
import { isEnabled } from "@erxes/api-utils/src/serviceDiscovery";
import { getConfig, sendMessageBroker } from "../messageBroker";
import { IConfig } from "../interfaces/config";
import BigNumber from "bignumber.js";

const getCommitmentInterest = (
  contract,
  storeInterestDate,
  config: IConfig
) => {
  const diffDay = getDiffDay(contract.lastStoredDate, storeInterestDate);

  const unUsedAmount = new BigNumber(contract.leaseAmount)
    .minus(contract.balanceAmount)
    .toNumber();

  return calcInterest({
    balance: unUsedAmount,
    interestRate: contract.commitmentInterest,
    dayOfMonth: diffDay,
    fixed: config.calculationFixed
  });
};

const getStoredInterest = (contract, storeInterestDate, config: IConfig) => {
  const diffDay = getDiffDay(contract.lastStoredDate, storeInterestDate);

  return calcInterest({
    balance: contract.balanceAmount,
    interestRate: contract.interestRate,
    dayOfMonth: diffDay,
    fixed: config.calculationFixed
  });
};

export const loanStoredInterestClass = (models: IModels) => {
  class StoredInterest {
    public static async createStoredInterest(
      payDate: Date,
      periodLockId: string,
      subdomain?: string
    ) {
      const storeInterestDate = getFullDate(payDate);

      const config: IConfig = await getConfig("loansConfig", subdomain || "");

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
            "transactionIds.0": { $exists: true }
          }).sort({ payDate: -1 });

          if (!prevSchedule) contract.balanceAmount = contract.leaseAmount;
          else contract.balanceAmount = prevSchedule?.balance || 0;

          let storedInterest = getStoredInterest(
            contract,
            storeInterestDate,
            config
          );

          if (Number.isNaN(storedInterest)) continue;

          let commitmentInterest = getCommitmentInterest(
            contract,
            storeInterestDate,
            config
          );

          if (isEnabled("syncpolaris") && subdomain) {
            sendMessageBroker(
              {
                action: "storeInterest",
                subdomain: subdomain,
                data: {
                  number: contract.number,
                  amount: storedInterest,
                  description: `auto store interest ${contract.number}`
                }
              },
              "syncpolaris"
            );
          }

          await models.StoredInterest.create({
            amount: storedInterest,
            commitmentInterest: commitmentInterest,
            contractId: contract._id,
            invDate: storeInterestDate,
            // prevStoredDate: contract.lastStoredDate,
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

      return {};
    }

    public static async getStoredInterest(_id: string) {
      return await models.StoredInterest.findOne({ _id }).lean();
    }

    public static async updateStoredInterest(
      _id: string,
      storedInterest: IStoredInterest
    ) {
      return await models.StoredInterest.updateOne(
        { _id },
        { $set: storedInterest }
      );
    }
  }
  storedInterestSchema.loadClass(StoredInterest);
  return storedInterestSchema;
};

export interface IStoredInterestModel extends Model<IStoredInterestDocument> {
  createStoredInterest(payDate: Date, periodLockId: string, subdomain?: string);
  getStoredInterest(_id: string);
  updateStoredInterest(_id, storedInterest: IStoredInterest);
}
