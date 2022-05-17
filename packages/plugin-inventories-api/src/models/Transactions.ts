import { Model, model } from 'mongoose';
import * as _ from 'underscore';
import { IModels } from '../connectionResolver';
import {
  ITransaction,
  ITransactionDocument,
  transactionSchema
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
