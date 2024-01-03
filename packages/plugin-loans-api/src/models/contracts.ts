import {
  CONTRACT_STATUS,
  LEASE_TYPES,
  REPAYMENT,
  SCHEDULE_STATUS
} from './definitions/constants';
import {
  contractSchema,
  ICloseVariable,
  IContract
} from './definitions/contracts';
import { getCloseInfo } from './utils/closeUtils';
import { addMonths, getFullDate, getNumber } from './utils/utils';
import { Model } from 'mongoose';
import { IContractDocument } from './definitions/contracts';
import { IModels } from '../connectionResolver';
import { FilterQuery } from 'mongodb';
import { ITransaction } from './definitions/transactions';
import { IInsurancesData } from './definitions/contracts';
import { ICollateralData } from './definitions/contracts';

const getInsurancAmount = (
  insurancesData: IInsurancesData[],
  collateralsData: ICollateralData[]
) => {
  let result = 0;
  for (const data of insurancesData) {
    result += parseFloat((data.amount || 0).toString());
  }

  for (const data of collateralsData) {
    result += parseFloat((data.insuranceAmount || 0).toString());
  }
  return result;
};
export interface IContractModel extends Model<IContractDocument> {
  getContract(
    selector: FilterQuery<IContractDocument>
  ): Promise<IContractDocument>;
  createContract(doc: IContract): Promise<IContractDocument>;
  updateContract(_id, doc: IContract): Promise<IContractDocument>;
  closeContract(subdomain, doc: ICloseVariable);
  removeContracts(_ids);
}
export const loadContractClass = (models: IModels) => {
  class Contract {
    /**
     *
     * Get Contract
     */

    public static async getContract(
      selector: FilterQuery<IContractDocument>
    ): Promise<IContractDocument> {
      const contract = await models.Contracts.findOne(selector);

      if (!contract) {
        throw new Error('Contract not found');
      }

      return contract;
    }

    /**
     * Create a contract
     */
    public static async createContract({
      schedule,
      ...doc
    }: IContract & { schedule: any }): Promise<IContractDocument> {
      doc.startDate = getFullDate(doc.startDate || new Date());
      doc.lastStoredDate = getFullDate(doc.startDate || new Date());
      doc.endDate =
        doc.endDate ?? addMonths(new Date(doc.startDate), doc.tenor);
      if (!doc.useManualNumbering || !doc.number)
        doc.number = await getNumber(models, doc.contractTypeId);

      doc.insuranceAmount = getInsurancAmount(
        doc.insurancesData || [],
        doc.collateralsData || []
      );

      if (doc.repayment === REPAYMENT.CUSTOM && !schedule) {
        throw new Error('Custom graphic not exists');
      }

      const contract = await models.Contracts.create(doc);

      if (doc.repayment === REPAYMENT.CUSTOM && schedule.length > 0) {
        const schedules = schedule.map(a => {
          return {
            contractId: contract._id,
            status: SCHEDULE_STATUS.PENDING,
            payDate: a.payDate,

            balance: a.balance,
            interestNonce: a.interestNonce,
            payment: a.payment,
            total: a.total
          };
        });

        await models.FirstSchedules.insertMany(schedules);
        await models.Schedules.insertMany(schedules);
      }

      if (
        doc.leaseType === LEASE_TYPES.LINEAR ||
        doc.leaseType === LEASE_TYPES.SAVING
      ) {
        const schedules = [
          {
            contractId: contract._id,
            status: SCHEDULE_STATUS.PENDING,
            payDate: doc.endDate,
            balance: doc.leaseAmount,
            interestNonce: 0,
            payment: doc.leaseAmount,
            total: doc.leaseAmount
          }
        ];

        console.log('schedules', schedules);

        await models.FirstSchedules.insertMany(schedules);
      }

      return contract;
    }

    /**
     * Update Contract
     */
    public static async updateContract(
      _id,
      { schedule, ...doc }: IContract & { schedule: any }
    ): Promise<IContractDocument | null> {
      const oldContract = await models.Contracts.getContract({
        _id
      });

      if (oldContract.contractTypeId !== doc.contractTypeId) {
        doc.number = await getNumber(models, doc.contractTypeId);
      }

      if (!doc.collateralsData) {
        doc.collateralsData = oldContract.collateralsData;
      }

      doc.startDate = getFullDate(doc.startDate || new Date());
      doc.endDate =
        doc.endDate ?? addMonths(new Date(doc.startDate), doc.tenor);
      doc.insuranceAmount = getInsurancAmount(
        doc.insurancesData || [],
        doc.collateralsData || []
      );
      await models.Contracts.updateOne({ _id }, { $set: doc });
      const transactions = await models.Transactions.find({
        contractId: _id
      }).lean();
      if (
        doc.repayment === REPAYMENT.CUSTOM &&
        schedule.length > 0 &&
        transactions.length === 0
      ) {
        await models.FirstSchedules.deleteMany({ contractId: _id });
        await models.Schedules.deleteMany({ contractId: _id });

        const schedules = schedule.map(a => {
          return {
            contractId: _id,
            status: SCHEDULE_STATUS.PENDING,
            payDate: getFullDate(a.payDate),
            balance: a.balance,
            interestNonce: a.interestNonce,
            payment: a.payment,
            total: a.interestNonce + a.payment
          };
        });

        await models.FirstSchedules.insertMany(schedules);
        await models.Schedules.insertMany(schedules);
      }

      const contract = await models.Contracts.findOne({ _id });
      return contract;
    }

    /**
     * Close Contract
     */
    public static async closeContract(subdomain, doc: ICloseVariable) {
      const contract = await models.Contracts.getContract({
        _id: doc.contractId
      });
      const closeInfo = await getCloseInfo(
        models,
        subdomain,
        contract,
        doc.closeDate
      );

      const trDoc: ITransaction = {
        contractId: doc.contractId,
        payDate: doc.closeDate,
        description: doc.description,
        currency: contract.currency,
        total: closeInfo.total
      };
      await models.Transactions.createTransaction(subdomain, trDoc);

      await models.Contracts.updateOne(
        { _id: doc.contractId },
        {
          $set: {
            closeDate: doc.closeDate,
            closeType: doc.closeType,
            closeDescription: doc.description,
            status: CONTRACT_STATUS.CLOSED
          }
        }
      );

      return models.Contracts.getContract({
        _id: doc.contractId
      });
    }

    /**
     * Remove Contract category
     */
    public static async removeContracts(_ids) {
      const transactions = await models.Transactions.count({
        contractId: _ids
      });
      if (transactions > 0)
        throw new Error('You can not delete contract with transaction');
      await models.Schedules.deleteMany({
        contractId: { $in: _ids }
      });

      return models.Contracts.deleteMany({ _id: { $in: _ids } });
    }
  }
  contractSchema.loadClass(Contract);
  return contractSchema;
};
