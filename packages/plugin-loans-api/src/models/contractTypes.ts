import {
  IContractType,
  IContractTypeDocument,
  contractTypeSchema
} from './definitions/contractTypes';
import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import { FilterQuery } from 'mongoose';

export const loadContractTypeClass = (models: IModels) => {
  class ContractType {
    /**
     * Get ContractType
     */
    public static async getContractType(
      selector: FilterQuery<IContractTypeDocument>
    ) {
      const insuranceType = await models.ContractTypes.findOne(selector);

      if (!insuranceType) {
        throw new Error('ContractType not found');
      }

      return insuranceType;
    }

    /**
     * Create a insuranceType
     */
    public static async createContractType(doc: IContractType) {
      if (!doc.code) throw new Error('Code is required');
      if (!doc.number) throw new Error('Start Number is required');
      if (!doc.vacancy) throw new Error('Vacancy is required');
      if (!doc.name) throw new Error('Name is required');

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
    public static async removeContractTypes(_ids: string[]) {
      let deleteContractTypes: string[] = [];
      for await (let id of _ids) {
        const contract = await models.Contracts.findOne({ contractTypeId: _ids });
        if (!contract) {
          deleteContractTypes.push(id);
        }
      }

      return models.ContractTypes.deleteMany({
        _id: { $in: deleteContractTypes }
      });
    }
  }

  contractTypeSchema.loadClass(ContractType);
  return contractTypeSchema;
};
export interface IContractTypeModel extends Model<IContractTypeDocument> {
  getContractType(selector: FilterQuery<IContractTypeDocument>);
  createContractType(doc);
  updateContractType(_id, doc);
  removeContractTypes(_ids);
}