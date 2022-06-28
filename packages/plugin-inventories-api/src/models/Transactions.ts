import { Model, model } from 'mongoose';
import * as _ from 'underscore';
import { IModels } from '../connectionResolver';
import {
  ITransaction,
  ITransactionDocument,
  ITrItem,
  ITrItemDocument,
  transactionSchema,
  trItemSchema
} from './definitions/transactions';

export interface ITransactionModel extends Model<ITransactionDocument> {
  getTransaction(_id: string): Promise<ITransactionDocument>;
  createTransaction(doc: ITransaction): Promise<ITransactionDocument>;
  updateTransaction(
    _id: string,
    doc: ITransaction
  ): Promise<ITransactionDocument>;
  removeTransaction(_id: string): void;
}

export const loadTransactionClass = (models: IModels) => {
  class Transaction {
    /*
     * Get a transaction
     */
    public static async getTransaction(_id: string) {
      const transaction = await models.Transactions.findOne({ _id });

      if (!transaction) {
        throw new Error('Transaction not found');
      }

      return transaction;
    }

    /**
     * Create a transaction
     */
    public static async createTransaction(doc: ITransaction) {
      const transaction = await models.Transactions.create({
        ...doc,
        createdAt: new Date()
      });

      return transaction;
    }

    /**
     * Update Transaction
     */
    public static async updateTransaction(_id: string, doc: ITransaction) {
      const transaction = await models.Transactions.getTransaction(_id);

      await models.Transactions.updateOne({ _id }, { $set: { ...doc } });

      const updated = await models.Transactions.getTransaction(_id);

      return updated;
    }

    /**
     * Remove Transaction
     */
    public static async removeTransaction(_id: string) {
      await models.Transactions.getTransaction(_id);
      return models.Transactions.deleteOne({ _id });
    }
  }

  transactionSchema.loadClass(Transaction);

  return transactionSchema;
};

// ============== items
export interface ITrItemModel extends Model<ITrItemDocument> {
  getTrItem(_id: string): Promise<ITrItemDocument>;
  createTrItem(doc: ITrItem): Promise<ITrItemDocument>;
  updateTrItem(_id: string, doc: ITrItem): Promise<ITrItemDocument>;
  removeTrItem(_id: string): void;
}

export const loadTrItemClass = (models: IModels) => {
  class TrItem {
    /*
     * Get a trItem
     */
    public static async getTrItem(_id: string) {
      const trItem = await models.TrItems.findOne({ _id });

      if (!trItem) {
        throw new Error('TrItem not found');
      }

      return trItem;
    }

    /**
     * Create a trItem
     */
    public static async createTrItem(doc: ITrItem) {
      const trItem = await models.TrItems.create({
        ...doc,
        createdAt: new Date()
      });

      return trItem;
    }

    /**
     * Update TrItem
     */
    public static async updateTrItem(_id: string, doc: ITrItem) {
      const trItem = await models.TrItems.getTrItem(_id);

      await models.TrItems.updateOne({ _id }, { $set: { ...doc } });

      const updated = await models.TrItems.getTrItem(_id);

      return updated;
    }

    /**
     * Remove TrItem
     */
    public static async removeTrItem(_id: string) {
      await models.TrItems.getTrItem(_id);
      return models.TrItems.deleteOne({ _id });
    }
  }

  trItemSchema.loadClass(TrItem);

  return trItemSchema;
};
