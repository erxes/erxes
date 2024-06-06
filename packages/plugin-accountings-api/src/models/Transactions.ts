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
  linkTransaction(_ids: string[], ptrId?: string): Promise<ITransactionDocument[]>;
  createTransaction(doc: ITransaction): Promise<ITransactionDocument>;
  createPTransaction(docs: ITransaction[]): Promise<ITransactionDocument[]>;
  updateTransaction(_id: string, doc: ITransaction): Promise<ITransactionDocument>;
  createTrDetail(_id: string, doc: ITransaction): Promise<ITransactionDocument>;
  updateTrDetail(_id: string, doc: ITransaction): Promise<ITransactionDocument>;
  removeTrDetail(_id: string, doc: ITransaction): Promise<ITransactionDocument>;
  removeTransaction(_id: string): Promise<string>;
  removePTransaction(_ids: string[]): Promise<{ n: number; ok: number }>;
}

export const loadTransactionClass = (models: IModels, subdomain: string) => {
  class Transaction {
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

    public static async checkPtr(ptrId: string) {
      const allTrs = await models.Transactions.find({ ptrId });
      return setPtrStatus(models, allTrs)
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

      const newTr = await models.Transactions.create({ ...lastDoc });
      newTr.ptrStatus = await this.checkPtr(newTr.ptrId);

      return newTr
    }

    /**
     * Update transaction
     */
    public static async updateTransaction(_id: string, doc: ITransaction) {
      const oldTr = await models.Transactions.getTransaction({ _id });

      await models.Transactions.updateOne({ _id }, {
        $set: {
          ...doc,
          parentId: doc.parentId || _id,
          sumDt: doc.details.filter(d => d.side === TR_SIDES.DEBIT).reduce((sum, cur) => sum + cur.amount, 0),
          sumCt: doc.details.filter(d => d.side === TR_SIDES.CREDIT).reduce((sum, cur) => sum + cur.amount, 0),
          modifiedAt: new Date()
        }
      });
      await this.checkPtr(oldTr.ptrId);

      return await models.Transactions.findOne({ _id }).lean();
    }

    public static async linkTransaction(_ids: string[], ptrId?: string) {
      if (!ptrId) {
        ptrId = nanoid();
      }
      await models.Transactions.updateMany({ _id: { $in: _ids } }, { $set: { ptrId } });
      await this.checkPtr(ptrId);
      return models.Transactions.find({ ptrId })
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
     * Remove transaction
     */
    public static async removeTransaction(_id: string) {
      const transaction = await models.Transactions.getTransaction({
        _id,
      });

      if (transaction.originId) {
        throw new Error('cant remove this transaction. Remove the source transaction first')
      }

      if (await models.Transactions.find({ preTrId: _id })) {
        throw new Error('cant remove this transaction. Remove the dependent transaction first')
      }

      await models.Transactions.deleteMany({ $or: [{ _id }, { _id: { $in: (transaction.follows || []).map(tr => tr.id) } }] });

      return 'success'
    }
  }

  transactionSchema.loadClass(Transaction);

  return transactionSchema;
};

