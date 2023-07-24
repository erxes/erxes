import { CONTRACT_STATUS } from './definitions/constants';
import {
  contractSchema,
  ICloseVariable,
  IContract
} from './definitions/contracts';
import { getCloseInfo } from './utils/closeUtils';
import { getFullDate, getNumber } from './utils/utils';
import { Model } from 'mongoose';
import { IContractDocument } from './definitions/contracts';
import { IModels } from '../connectionResolver';
import { FilterQuery } from 'mongodb';
import { ITransaction } from './definitions/transactions';
import { ICollateralDataDoc } from './definitions/contracts';
import { IInsurancesData } from './definitions/contracts';
import { ICollateralData } from './definitions/contracts';

const getLeaseAmount = (collateralsData: ICollateralDataDoc[]) => {
  let lease = 0;
  let margin = 0;

  for (const data of collateralsData) {
    lease += parseFloat(data.leaseAmount.toString());
    margin += parseFloat(data.marginAmount.toString());
  }

  return { lease, margin };
};

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
  closeContract(messageBroker, memoryStorage, doc: ICloseVariable);
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
    public static async createContract(
      doc: IContract
    ): Promise<IContractDocument> {
      doc.startDate = getFullDate(doc.startDate || new Date());
      doc.number = await getNumber(models, doc.contractTypeId);

      doc.insuranceAmount = getInsurancAmount(
        doc.insurancesData || [],
        doc.collateralsData || []
      );
      const contract = await models.Contracts.create(doc);

      return contract;
    }

    /**
     * Update Contract
     */
    public static async updateContract(
      _id,
      doc: IContract
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

      doc.insuranceAmount = getInsurancAmount(
        doc.insurancesData || [],
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
      subdomain,
      memoryStorage,
      doc: ICloseVariable
    ) {
      const contract = await models.Contracts.getContract({
        _id: doc.contractId
      });
      const closeInfo = await getCloseInfo(
        models,
        memoryStorage,
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
      await models.Schedules.deleteMany({
        contractId: { $in: _ids }
      });

      return models.Contracts.deleteMany({ _id: { $in: _ids } });
    }
  }
  contractSchema.loadClass(Contract);
  return contractSchema;
};
