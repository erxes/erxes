import { Model } from 'mongoose';
import * as _ from 'underscore';
import { IModels } from '../connectionResolver';
import {
  ITransaction,
  ITransactionDocument,
  transactionSchema
} from './definitions/transactions';

export interface ITransactionModel extends Model<ITransactionDocument> {
  transactionDetail(_id: string): Promise<ITransactionDocument>;
  transactionAdd(doc: ITransaction): Promise<ITransactionDocument>;
}

export const loadTransactionClass = (models: IModels) => {
  class Transaction {
    /**
     * Get a transaction
     */
    public static async transactionDetail(_id: string) {
      const transaction = await models.Transactions.findOne({ _id });

      if (!transaction) {
        throw new Error('Transaction not found');
      }

      return transaction;
    }
  }

  transactionSchema.loadClass(Transaction);

  return transactionSchema;
};
