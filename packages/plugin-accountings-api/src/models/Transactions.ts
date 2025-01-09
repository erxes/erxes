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
import { commonCreate } from '../utils/commonCreate';
import { IUserDocument } from '@erxes/api-utils/src/definitions/users';
import { commonUpdate } from '../utils/commonUpdate';

export interface ITransactionModel extends Model<ITransactionDocument> {
  getTransaction(selector: any): Promise<ITransactionDocument>;
  getPTransactions(selector: any): Promise<ITransactionDocument[]>;
  linkTransaction(_ids: string[], ptrId?: string): Promise<ITransactionDocument[]>;
  createTransaction(doc: ITransaction): Promise<ITransactionDocument>;
  createPTransaction(docs: ITransaction[], user: IUserDocument): Promise<ITransactionDocument[]>;
  updatePTransaction(parentId: string, doc: ITransaction[], user: IUserDocument): Promise<ITransactionDocument[]>;
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
    public static async createPTransaction(docs: ITransaction[], user: IUserDocument) {
      const transactions: ITransactionDocument[] = []
      let errMsg: string = '';

      const session = await connection.startSession();
      session.startTransaction();
      try {
        const ptrId = nanoid();
        let parentId = '';

        for (const doc of docs) {
          if (doc._id?.substring(0, 4) === 'temp') {
            delete doc._id
          }

          if (!parentId) {
            const firstTrs = await commonCreate(models, { ...doc, ptrId });
            parentId = firstTrs.mainTr.parentId;
            transactions.push(firstTrs.mainTr);
            if (firstTrs.otherTrs?.length) {
              for (const otherTr of firstTrs.otherTrs) {
                transactions.push(otherTr)
              }
            }
          } else {
            const trs = await commonCreate(models, { ...doc, ptrId, parentId });
            transactions.push(trs.mainTr);
            if (trs.otherTrs?.length) {
              for (const otherTr of trs.otherTrs) {
                transactions.push(otherTr)
              }
            }
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
     * Create a perfect transactions
     */
    public static async updatePTransaction(parentId: string, docs: (ITransaction & { _id?: string })[], user: IUserDocument) {
      const oldTrs = await models.Transactions.find({ parentId, $or: [{ originId: { $exists: false } }, { originId: { $eq: '' } }] }).lean();
      if (!oldTrs.length) {
        throw new Error('Not found old transactions')
      }

      const ptrId = oldTrs[0].ptrId;

      if (!ptrId) {
        throw new Error('Not found old transactions ptr')
      }

      const oldTrIds = oldTrs.map(ot => ot._id)

      const addTrDocs: ITransaction[] = [];
      const editTrDocs: ITransaction[] = [];

      for (const doc of docs) {
        if (oldTrIds.includes(doc._id || '')) {
          editTrDocs.push(doc);
        } else {
          addTrDocs.push(doc);
        }
      }

      const editTrIds = editTrDocs.map(itd => itd._id)
      const deleteTrs: ITransaction[] = oldTrs.filter(otr => !editTrIds.includes(otr._id))

      const transactions: ITransactionDocument[] = []
      let errMsg: string = '';

      const session = await connection.startSession();
      session.startTransaction();
      try {
        for (const doc of editTrDocs) {
          const trs = await commonUpdate(models, { ...doc, ptrId, parentId }, oldTrs.find(ot => ot._id === doc._id));
          transactions.push(trs.mainTr);
          if (trs.otherTrs?.length) {
            for (const otherTr of trs.otherTrs) {
              transactions.push(otherTr)
            }
          }
        }

        for (const doc of addTrDocs) {
          const trs = await commonCreate(models, { ...doc, ptrId, parentId })
          transactions.push(trs.mainTr);
          if (trs.otherTrs?.length) {
            for (const otherTr of trs.otherTrs) {
              transactions.push(otherTr)
            }
          }
        }

        for (const tr of deleteTrs) {
          await models.Transactions.deleteMany({ $or: [{ _id: tr._id }, { _id: { $in: (tr.follows || []).map(tr => tr.id) } }] });
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

