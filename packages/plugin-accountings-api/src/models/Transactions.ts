import * as _ from 'lodash';
import { Model, connection } from 'mongoose';
import { nanoid } from 'nanoid';
import { IModels } from '../connectionResolver';
import {
  ITransaction,
  ITransactionDocument,
  transactionSchema,
} from './definitions/transaction';
import { PTR_STATUSES, TR_SIDES } from './definitions/constants';
import { setPtrStatus } from './utils';

export interface ITransactionModel extends Model<ITransactionDocument> {
  getTransaction(selector: any): Promise<ITransactionDocument>;
  getPTransactions(selector: any): Promise<ITransactionDocument[]>;
  createTransaction(doc: ITransaction): Promise<ITransactionDocument>;
  createPTransaction(docs: ITransaction[]): Promise<ITransactionDocument[]>;
  updateTransaction(_id: string, doc: ITransaction): Promise<ITransactionDocument>;
  createTrDetail(_id: string, doc: ITransaction): Promise<ITransactionDocument>;
  updateTrDetail(_id: string, doc: ITransaction): Promise<ITransactionDocument>;
  removeTrDetail(_id: string, doc: ITransaction): Promise<ITransactionDocument>;
  removeTransaction(_ids: string[]): Promise<{ n: number; ok: number }>;
  removePTransaction(_ids: string[]): Promise<{ n: number; ok: number }>;
}

export const loadTransactionClass = (models: IModels, subdomain: string) => {
  class Account {
    /**
     *
     * Get Transaction
     */

    public static async getTransaction(selector: any) {
      const transaction = await models.Transactions.findOne(selector).lean();

      if (!transaction) {
        throw new Error('Transaction not found');
      }

      return transaction;
    }

    public static async getPTransactions(selector: any) {
      const transaction = await models.Transactions.findOne(selector).lean();

      if (!transaction) {
        throw new Error('Transactions not found');
      }

      return await models.Transactions.find({ ptrId: transaction.ptrId, parentId: transaction.parentId }).lean();
    }

    /**
     * Create a transaction
     */
    public static async createTransaction(doc: ITransaction) {
      if (!doc.details?.length) {
        throw new Error('Transactions not created, cause: has not details');
      }
      const _id = nanoid();
      const lastDoc = {
        ...doc,
        _id,
        ptrId: doc.ptrId || nanoid(),
        parentId: doc.parentId || _id,
        ptrStatus: PTR_STATUSES.UNKNOWN,
        sumDt: doc.details.filter(d => d.side === TR_SIDES.DEBIT).reduce((sum, cur) => sum + cur.amount, 0),
        sumCt: doc.details.filter(d => d.side === TR_SIDES.CREDIT).reduce((sum, cur) => sum + cur.amount, 0),
        createdAt: new Date(),
      };

      return models.Transactions.create({ ...lastDoc });
    }

    /**
     * Create a perfect transactions
     */
    public static async createPTransaction(docs: ITransaction[]) {
      const transactions: ITransactionDocument[] = []
      let errMsg: string = '';

      const session = await connection.startSession();
      session.startTransaction();
      try {
        const ptrId = nanoid();
        let parentId = '';

        for (const doc of docs) {
          if (!parentId) {
            const firstTr = await this.createTransaction({ ...doc, ptrId });
            parentId = firstTr.parentId;
            transactions.push(firstTr);
          } else {
            transactions.push(await this.createTransaction({ ...doc, ptrId, parentId }));
          }
        }

        await setPtrStatus(models, transactions);

        await session.commitTransaction();

      } catch (e) {
        errMsg = e.message;
        await session.abortTransaction();
      } finally {
        session.endSession();
      }

      if (errMsg) {
        throw new Error(errMsg)
      }

      return transactions;
    }

    /**
     * Update transaction
     */
    public static async updateTransaction(_id: string, doc: ITransaction) {
      const oldAccount = await models.Transactions.getTransaction({ _id });

      await models.Transactions.updateOne({ _id }, { $set: doc });

      return await models.Transactions.findOne({ _id }).lean();
    }

    /**
     * Remove transaction
     */
    public static async removeTransactions(_ids: string[]) {

    }
  }

  transactionSchema.loadClass(Account);

  return transactionSchema;
};

