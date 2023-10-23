import { CONTRACT_STATUS } from './definitions/constants';
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

export interface IContractModel extends Model<IContractDocument> {
  getContract(
    selector: FilterQuery<IContractDocument>
  ): Promise<IContractDocument>;
  createContract(doc: IContract): Promise<IContractDocument>;
  updateContract(_id, doc: IContract): Promise<IContractDocument>;
  closeContract(subdomain, doc: ICloseVariable);
  getContractAlert();
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
      doc.status = CONTRACT_STATUS.NORMAL;
      doc.startDate = getFullDate(doc.startDate || new Date());
      doc.endDate = addMonths(new Date(doc.startDate), doc.duration);
      doc.lastStoredDate = getFullDate(doc.startDate || new Date());
      doc.number = await getNumber(models, doc.contractTypeId);

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

      doc.startDate = getFullDate(doc.startDate || new Date());
      doc.endDate = addMonths(new Date(doc.startDate), doc.duration);
      doc.lastStoredDate = getFullDate(doc.startDate || new Date());

      await models.Contracts.updateOne({ _id }, { $set: doc });

      const contract = await models.Contracts.findOne({ _id });
      return contract;
    }

    /**
     * Close Contract
     */
    public static async closeContract(subdomain, doc: ICloseVariable) {
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

      return models.Contracts.deleteMany({ _id: { $in: _ids } });
    }

    public static async getContractAlert() {}
  }
  contractSchema.loadClass(Contract);
  return contractSchema;
};
