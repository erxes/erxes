import { Model } from 'mongoose';
import * as _ from 'underscore';
import { IModels } from '../connectionResolver';
import {
  ITransactionItem,
  ITransactionItemDocument,
  transactionItemSchema
} from './definitions/transactionItems';

export interface ITransactionItemModel extends Model<ITransactionItemDocument> {
  getItem(_id: string): Promise<ITransactionItemDocument>;
  createItem(doc: ITransactionItem): Promise<ITransactionItemDocument>;
}

export const loadTransactionItemClass = (models: IModels) => {
  class TransactionItem {
    /**
     * Get transaction item
     * @param _id Transaction item ID
     * @returns Found object
     */
    public static async getItem(_id: string) {
      const result = await models.TransactionItems.findById(_id);

      if (!result) throw new Error('Transaction item not found');

      return result;
    }

    /**
     * Create transaction item
     * @param doc New data to create
     * @returns Created response
     */
    public static async createItem(doc: ITransactionItem) {
      return await models.TransactionItems.create(doc);
    }
  }

  transactionItemSchema.loadClass(TransactionItem);

  return transactionItemSchema;
};
