import { Model } from 'mongoose';
import * as _ from 'underscore';
import { IModels } from '../connectionResolver';
import {
  ITransaction,
  ITransactionDocument,
  transactionSchema
} from './definitions/transactions';

export interface ITransactionModel extends Model<ITransactionDocument> {
  createTransaction(doc: ITransaction): Promise<ITransactionDocument>;
}

export const loadTransactionClass = (models: IModels) => {
  class Transaction {
    public static async createTransaction(doc: ITransaction) {
      return models.Transactions.create({
        ...doc,
        createdAt: new Date()
      });
    }
  }

  transactionSchema.loadClass(Transaction);

  return transactionSchema;
};
