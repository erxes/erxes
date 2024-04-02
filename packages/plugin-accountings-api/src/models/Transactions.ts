import * as _ from 'lodash';
import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import {
  ITransaction,
  ITransactionDocument,
  transactionSchema,
} from './definitions/transaction';

export interface ITransactionModel extends Model<ITransactionDocument> {
  getTransaction(selector: any): Promise<ITransactionDocument>;
  createTransaction(doc: ITransaction): Promise<ITransactionDocument>;
  updateTransaction(_id: string, doc: ITransaction): Promise<ITransactionDocument>;
  removeTransactions(_ids: string[]): Promise<{ n: number; ok: number }>;
}

export const loadTransactionClass = (models: IModels, subdomain: string) => {
  class Account {
    /**
     *
     * Get Accounting Cagegory
     */

    public static async getTransaction(selector: any) {
      const accounting = await models.Transactions.findOne(selector).lean();

      if (!accounting) {
        throw new Error('Accounting not found');
      }

      return accounting;
    }

    /**
     * Create a accounting
     */
    public static async createTransaction(doc: ITransaction) {
      return models.Transactions.create({ ...doc, createdAt: new Date() });
    }

    /**
     * Update Accounting
     */
    public static async updateTransaction(_id: string, doc: ITransaction) {
      const oldAccount = await models.Transactions.getTransaction({ _id });

      await models.Transactions.updateOne({ _id }, { $set: doc });

      return await models.Transactions.findOne({ _id }).lean();
    }

    /**
     * Remove accountings
     */
    public static async removeTransactions(_ids: string[]) {
      
    }
  }

  transactionSchema.loadClass(Account);

  return transactionSchema;
};

