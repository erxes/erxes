import { CONTRACT_STATUS } from './definitions/constants';
import {
  contractSchema,
  ICloseVariable,
  IContract
} from './definitions/contracts';
import { getCloseInfo } from './utils/closeUtils';
import { getFullDate, getNumber } from './utils/utils';
import { Model } from 'mongoose';
import { IContractDocument } from '../models/definitions/contracts';

const getLeaseAmount = collateralsData => {
  let lease = 0;
  let margin = 0;

  for (const data of collateralsData) {
    lease += parseFloat(data.leaseAmount);
    margin += parseFloat(data.marginAmount);
  }

  return { lease, margin };
};

const getInsurancAmount = (insurancesData, collateralsData) => {
  let result = 0;
  for (const data of insurancesData) {
    result += parseFloat(data.amount);
  }

  for (const data of collateralsData) {
    result += parseFloat(data.insuranceAmount || 0);
  }
  return result;
};
export interface IContractModel extends Model<IContractDocument> {
  getContract(selector: any);
  createContract(doc: IContract);
  updateContract(_id, doc: IContract);
  closeContract(messageBroker, memoryStorage, doc: ICloseVariable);
  removeContracts(_ids);
}
export const loadContractClass = models => {
  class Contract {
    /**
     *
     * Get Contract
     */

    public static async getContract(selector: any) {
      const contract = await models.Contracts.findOne(selector);

      if (!contract) {
        throw new Error('Contract not found');
      }

      return contract;
    }

    /**
     * Create a contract
     */
    public static async createContract(doc: IContract) {
      doc.startDate = getFullDate(doc.startDate || new Date());
      doc.number = await getNumber(models, doc.contractTypeId);

      const { lease, margin } = getLeaseAmount(doc.collateralsData || []);
      const leaseAmount = lease || doc.leaseAmount || 0;
      doc.leaseAmount = lease || doc.leaseAmount;
      doc.marginAmount = margin || doc.marginAmount;
      doc.feeAmount = (leaseAmount / 100) * 0.5;

      doc.insuranceAmount = getInsurancAmount(
        doc.insuranceAmount || [],
        doc.collateralsData || []
      );
      const contract = await models.Contracts.create(doc);

      return contract;
    }

    /**
     * Update Contract
     */
    public static async updateContract(_id, doc: IContract) {
      const oldContract = await models.Contracts.getContract(models, {
        _id
      });

      if (oldContract.contractTypeId !== doc.contractTypeId) {
        doc.number = await getNumber(models, doc.contractTypeId);
      }

      if (!doc.collateralsData) {
        doc.collateralsData = oldContract.collateralsData;
      }

      doc.startDate = getFullDate(doc.startDate || new Date());
      const { lease, margin } = getLeaseAmount(doc.collateralsData || []);
      doc.leaseAmount = lease || doc.leaseAmount;
      doc.marginAmount = margin || doc.marginAmount;
      doc.feeAmount = (doc.leaseAmount / 100) * 0.5;

      doc.insuranceAmount = getInsurancAmount(
        doc.insuranceAmount || [],
        doc.collateralsData || []
      );
      await models.Contracts.updateOne({ _id }, { $set: doc });

      const contract = await models.Contracts.findOne({ _id });
      return contract;
    }

    /**
     * Close Contract
     */
    public static async closeContract(
      messageBroker,
      memoryStorage,
      doc: ICloseVariable
    ) {
      const contract = await models.Contracts.getContract(models, {
        _id: doc.contractId
      });
      const closeInfo = await getCloseInfo(
        models,
        memoryStorage,
        contract,
        doc.closeDate
      );

      const trDoc = {
        contractId: doc.contractId,
        payDate: doc.closeDate,
        description: doc.description,
        total: closeInfo.total
      };
      await models.Transactions.createTransaction(
        models,
        messageBroker,
        memoryStorage,
        trDoc
      );

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

      return models.Contracts.getContract(models, {
        _id: doc.contractId
      });
    }

    /**
     * Remove Contract category
     */
    public static async removeContracts(_ids) {
      await models.RepaymentSchedules.deleteMany({
        contractId: { $in: _ids }
      });

      return models.Contracts.deleteMany({ _id: { $in: _ids } });
    }
  }
  contractSchema.loadClass(Contract);
  return contractSchema;
};
