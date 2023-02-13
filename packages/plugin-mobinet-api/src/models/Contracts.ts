import { Model } from 'mongoose';

import { IModels } from '../connectionResolver';
import {
  IContract,
  IContractDocument,
  contractSchema
} from './definitions/contracts';

export interface IContractModel extends Model<IContractDocument> {
  createContract(doc): Promise<IContractDocument>;
  updateContract(_id: string, doc: IContract): void;
  getContract(doc: any): Promise<IContractDocument>;
  removeContract(_id: string): void;
}

export const loadContractClass = (models: IModels) => {
  class Contract {
    public static async createContract(doc) {
      return models.Contracts.create(doc);
    }

    public static async updateContract(_id: string, doc: IContract) {
      await models.Contracts.getContract({ _id });
      await models.Contracts.updateOne({ _id }, { $set: { ...doc } });

      return models.Contracts.getContract({ _id });
    }

    public static async removeContract(_id: string) {
      return models.Contracts.deleteOne({ _id });
    }

    public static async getContract(doc: any) {
      const contract = await models.Contracts.findOne(doc);

      if (!contract) {
        throw new Error('Contract not found');
      }

      return contract;
    }
  }

  contractSchema.loadClass(Contract);

  return contractSchema;
};
