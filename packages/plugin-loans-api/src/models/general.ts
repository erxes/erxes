import {
  IGeneral,
  IGeneralDocument,
  generalSchema
} from './definitions/general';
import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import { ITransactionDocument } from './definitions/transactions';
import { generateFinance } from './utils/finaceUtils';

export const loadGeneralClass = (models: IModels) => {
  class General {
    /**
     * Create a periodLock
     */
    public static async createGeneral(
      transactions: ITransactionDocument[],
      periodLockId: string
    ) {
      const generals: any[] = [];

      for await (let mur of transactions) {
        let general = await generateFinance(mur, models, periodLockId);
        generals.push(general);
      }
      var res = await models.General.insertMany(generals);

      return res;
    }
  }
  generalSchema.loadClass(General);
  return generalSchema;
};

export interface IGeneralModel extends Model<IGeneralDocument> {
  createGeneral(transactions: ITransactionDocument[], periodLockId: string);
}
