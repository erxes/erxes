import { Model } from 'mongoose';
import * as _ from 'underscore';
import { IModels } from '../connectionResolver';
import {
  ITransactionItem,
  ITransactionItemDocument,
  transactionItemSchema
} from './definitions/transactionItems';

export interface ITransactionItemModel extends Model<ITransactionItemDocument> {
  getTrItem(_id: string): Promise<ITransactionItemDocument>;
  createTrItem(doc: ITransactionItem): Promise<ITransactionItemDocument>;
  updateTrItem(
    _id: string,
    doc: ITransactionItem
  ): Promise<ITransactionItemDocument>;
  removeTrItem(_id: string): void;
}

export const loadTransactionItemClass = (models: IModels) => {
  class TransactionItem {
    /**
     * Get a transaction Item
     */
    public static async getItem(_id: string) {
      const result = await models.TransactionItems.findOne({ _id });

      if (!result) {
        throw new Error('TrItem not found');
      }

      return result;
    }

    /**
     * Create a trItem
     */
    public static async createItem(doc: ITransactionItem) {
      const result = await models.TransactionItems.create({
        ...doc,
        createdAt: new Date()
      });

      return result;
    }

    /**
     * Update TrItem
     */
    public static async updateItem(_id: string, doc: ITransactionItem) {
      const result = await models.TransactionItems.getTrItem(_id);

      await models.TransactionItems.updateOne({ _id }, { $set: { ...doc } });

      const updated = await models.TransactionItems.getTrItem(_id);

      return updated;
    }

    /**
     * Remove TrItem
     */
    public static async removeItem(_id: string) {
      await models.TransactionItems.getTrItem(_id);
      return models.TransactionItems.deleteOne({ _id });
    }
  }

  transactionItemSchema.loadClass(TransactionItem);

  return transactionItemSchema;
};
