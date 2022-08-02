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
     * Get a Transaction Item
     */
    public static async getItem(_id: string) {
      const result = await models.TransactionItems.findOne({ _id });

      if (!result) {
        throw new Error('TrItem not found');
      }

      return result;
    }

    /**
     * Create a TransactionItem
     */
    public static async createItem(doc: ITransactionItem) {
      const result = await models.TransactionItems.create({
        ...doc,
        createdAt: new Date()
      });

      return result;
    }
  }

  transactionItemSchema.loadClass(TransactionItem);

  return transactionItemSchema;
};
