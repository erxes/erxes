import { IContractTypeDocument } from '../models/definitions/contractTypes';
import { Model, Document } from 'mongoose';
import { contractTypeSchema } from '../models/definitions/contractTypes';

export const loadContractTypeClass = models => {
  class ContractType {
    /**
     *
     * Get ContractType
     */

    public static async getContractType(selector: any) {
      const insuranceType = await models.ContractTypes.findOne(selector);

      if (!insuranceType) {
        throw new Error('ContractType not found');
      }

      return insuranceType;
    }

    /**
     * Create a insuranceType
     */
    public static async createContractType(doc) {
      return models.ContractTypes.create(doc);
    }

    /**
     * Update ContractType
     */
    public static async updateContractType(_id, doc) {
      await models.ContractTypes.updateOne({ _id }, { $set: doc });

      return models.ContractTypes.findOne({ _id });
    }

    /**
     * Remove ContractType
     */
    public static async removeContractTypes(_ids) {
      // await models.ContractTypes.getContractTypeCatogery(models, { _id });
      // TODO: check collateralsData
      return models.ContractTypes.deleteMany({ _id: { $in: _ids } });
    }
  }

  contractTypeSchema.loadClass(ContractType);
  return contractTypeSchema;
};
export interface IContractTypeModel extends Model<IContractTypeDocument> {
  getContractType(selector: any);
  createContractType(doc);
  updateContractType(_id, doc);
  removeContractTypes(_ids);
}
