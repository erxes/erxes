import { Model } from 'mongoose';

import { IModels } from '../connectionResolver';
import {
  IGolomtBankTransation,
  IGolomtBankTransationDocument,
  golomtBankTransationSchema
} from './definitions/golomtBankTransaction';

export interface IGolomtBankTransactionModel extends Model<IGolomtBankTransationDocument> {
  createTransaction(doc: IGolomtBankTransation): Promise<IGolomtBankTransationDocument>;
  getConfig(doc: string): Promise<IGolomtBankTransationDocument>;
}

export const loadGolomtBankConfigClass = (models: IModels) => {
  
  class GolomtBankTransaction {
    public static async createTransaction(doc: IGolomtBankTransation) {
      return models.GolomtBankTransaction.create(doc);
    }

    public static async getTransaction(doc: any) {
      const golomtBankTransaction = await models.GolomtBankConfig.findOne(doc);

      if (!golomtBankTransaction) {
        throw new Error('Transaction not found');
      }

      return golomtBankTransaction;
    }
  }

  golomtBankTransationSchema.loadClass(GolomtBankTransaction);

  return golomtBankTransationSchema;
};
