import { EventDispatcherReturn } from 'erxes-api-shared/core-modules';
import { getFullDate, graphqlPubsub } from 'erxes-api-shared/utils';
import moment from 'moment';
import { Model, connection } from 'mongoose';
import { nanoid } from 'nanoid';
import { IModels } from '~/connectionResolvers';
import { PTR_STATUSES, TR_SIDES, TR_STATUSES } from '../../@types/constants';
import { ITransaction, ITransactionDocument } from '../../@types/transaction';
import { commonRemove } from '../../utils/commonRemove';
import { commonSave } from '../../utils/commonSave';
import { assertCanWriteTransactionAccounts } from '../../utils/trPermissions';
import { transactionSchema } from '../definitions/transaction';
import { generateTrStatusActivityLog, setPtrStatus } from './utils';

export interface ITransactionModel extends Model<ITransactionDocument> {
  getTransaction(selector: any): Promise<ITransactionDocument>;
  getPTransactions(selector: any): Promise<ITransactionDocument[]>;
  getOriginTransactions(trId: string): Promise<{
    mainTr: ITransactionDocument;
    otherTrs: ITransactionDocument[];
  }>;
  linkTransaction(
    _ids: string[],
    ptrId?: string,
  ): Promise<ITransactionDocument[]>;
  createTransaction(
    doc: ITransaction,
    userId: string,
  ): Promise<ITransactionDocument>;
  updateTransaction(
    _id: string,
    doc: ITransaction,
    userId: string,
  ): Promise<ITransactionDocument>;
  createPTransaction(
    docs: ITransaction[],
    userId: string,
    options?: { skipAccountPermission?: boolean },
  ): Promise<ITransactionDocument[]>;
  updatePTransaction(
    parentId: string,
    docs: (ITransaction & { _id?: string })[],
    userId: string,
    options?: { skipAccountPermission?: boolean },
  ): Promise<ITransactionDocument[]>;
  createTrDetail(_id: string, doc: ITransaction): Promise<ITransactionDocument>;
  updateTrDetail(_id: string, doc: ITransaction): Promise<ITransactionDocument>;
  removeTrDetail(_id: string, doc: ITransaction): Promise<ITransactionDocument>;
  removeTransaction(_id: string): Promise<string>;
  removePTransaction({
    parentId,
    ptrId,
  }: {
    parentId?: string;
    ptrId?: string;
  }): Promise<{ n: number; ok: number }>;
}

const normalizeParentWorkflowDocs = (
  docs: (ITransaction & { _id?: string })[],
  userId: string,
  oldTr?: ITransactionDocument,
) => {
  const firstDoc = docs[0];

  if (!firstDoc) {
    return docs;
  }

  const status = firstDoc.status;
  const isReturned = status === TR_STATUSES.RETURNED;
  const mentionOwnerId = isReturned
    ? userId
    : firstDoc.mentionOwnerId || oldTr?.mentionOwnerId;
  let mentionUserIds = firstDoc.mentionUserIds || oldTr?.mentionUserIds || [];

  if (isReturned) {
    mentionUserIds = oldTr?.mentionOwnerId ? [oldTr.mentionOwnerId] : [];
  }

  return docs.map((doc) => ({
    ...doc,
    status,
    mentionOwnerId,
    mentionUserIds,
  }));
};

const cleanCreatePTransactionDoc = (doc: ITransaction & { _id?: string }) => {
  const cleanDoc = { ...doc };

  delete cleanDoc._id;
  delete cleanDoc.ptrId;
  delete cleanDoc.parentId;
  delete cleanDoc.ptrNumber;

  return cleanDoc;
};

const toPlainTransaction = (transaction?: ITransactionDocument) => {
  if (!transaction) {
    return;
  }

  return typeof (transaction as any).toObject === 'function'
    ? (transaction as any).toObject()
    : transaction;
};

const toPlainTransactions = (transactions: ITransactionDocument[] = []) =>
  transactions.map((transaction) => toPlainTransaction(transaction));

const publishTransactionChanged = (payload: {
  subdomain: string;
  parentId?: string;
  action: 'created' | 'updated' | 'removed';
  transaction?: ITransactionDocument | any;
  oldTransaction?: ITransactionDocument | any;
  transactions?: (ITransactionDocument | any)[];
  oldTransactions?: (ITransactionDocument | any)[];
  publishGlobal?: boolean;
}) => {
  const { subdomain, publishGlobal = true, ...eventPayload } = payload;
  const plainPayload = {
    ...eventPayload,
    transaction: toPlainTransaction(eventPayload.transaction),
    oldTransaction: toPlainTransaction(eventPayload.oldTransaction),
    transactions: toPlainTransactions(eventPayload.transactions),
    oldTransactions: toPlainTransactions(eventPayload.oldTransactions),
  };

  const channels = publishGlobal
    ? [`accountingTransactionChanged:${subdomain}`]
    : [];

  if (payload.parentId) {
    channels.push(
      `accountingTransactionChanged:${subdomain}:${payload.parentId}`,
    );
  }

  for (const channel of channels) {
    graphqlPubsub
      .publish(channel, {
        accountingTransactionChanged: plainPayload,
      })
      .catch((error) => {
        console.error('Failed to publish accounting transaction change', error);
      });
  }
};

export const loadTransactionClass = (
  models: IModels,
  subdomain: string,
  { sendDbEventLog, createActivityLog }: EventDispatcherReturn,
) => {
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
      return setPtrStatus(models, allTrs);
    }

    public static async getPTransactions(selector: any) {
      const transaction = await models.Transactions.findOne(selector).lean();

      if (!transaction) {
        throw new Error('Transactions not found');
      }

      return await models.Transactions.find({
        ptrId: transaction.ptrId,
        parentId: transaction.parentId,
      }).lean();
    }

    public static async getOriginTransactions(trId: string) {
      const transaction = await models.Transactions.findOne({
        _id: trId,
      }).lean();
      if (!transaction) {
        return {};
      }

      const otherTrs = await models.Transactions.find({
        parentId: transaction.parentId,
        $or: [{ originId: { $exists: false } }, { originId: '' }],
        _id: { $ne: trId },
      });

      return { mainTr: transaction, otherTrs };
    }

    static async generatePtrNumber() {
      const todayStr = moment().format('YYYYMMDDHH').toString();
      const latestTrs = await models.Transactions.aggregate([
        {
          $match: {
            $or: [
              { number: { $regex: new RegExp(`^${todayStr}_`) } },
              { ptrNumber: { $regex: new RegExp(`^${todayStr}_`) } },
            ],
          },
        },
        {
          $project: {
            groupNumber: { $ifNull: ['$ptrNumber', '$number'] },
          },
        },
        {
          $project: {
            groupNumber: 1,
            number_len: { $strLenCP: '$groupNumber' },
          },
        },
        { $sort: { number_len: -1, groupNumber: -1 } },
        { $limit: 1 },
      ]);
      const latestNumber = latestTrs[0]?.groupNumber || '';
      const latestSuffix = Number.parseInt(latestNumber.split('_')[1], 10) || 0;

      const counter = (await models.TransactionCounters.findOneAndUpdate(
        { _id: `ptrNumber:${todayStr}` },
        [
          {
            $set: {
              seq: {
                $add: [{ $max: [{ $ifNull: ['$seq', 0] }, latestSuffix] }, 1],
              },
              updatedAt: new Date(),
              createdAt: { $ifNull: ['$createdAt', new Date()] },
            },
          },
        ] as any,
        { upsert: true, returnDocument: 'after', lean: true },
      )) as any;

      const seq = counter?.seq || latestSuffix + 1;
      const suffix = String(seq).padStart(3, '0');

      return `${todayStr}_${suffix}`;
    }

    static async getPtrNumber(tr: ITransactionDocument) {
      const { _id, parentId } = tr;
      let number = '';

      while (true) {
        number = await this.generatePtrNumber();
        const duplicatedTrs = await models.Transactions.findOne({
          ptrNumber: number,
          parentId: { $ne: parentId },
        }).lean();

        if (!duplicatedTrs) {
          await models.Transactions.updateOne(
            { _id },
            { $set: { ptrNumber: number } },
          );

          if (!tr.number) {
            await models.Transactions.updateOne({ _id }, { $set: { number } });
          }

          return number;
        }
      }
    }

    static async syncParentWorkflowIdentifiers(
      parentId: string,
      ptrNumber: string,
    ) {
      if (!parentId || !ptrNumber) {
        return;
      }

      await models.Transactions.updateMany(
        { parentId },
        { $set: { parentId, ptrNumber } },
      );
    }

    /**
     * Create a one transaction
     */
    public static async createTransaction(doc: ITransaction, userId: string) {
      if (!doc.details?.length) {
        throw new Error('Transactions not created, cause: has not details');
      }

      const _id = doc._id || nanoid();
      doc.fullDate = getFullDate(doc.date);
      const lastDoc = {
        ...doc,
        _id,
        ptrId: doc.ptrId || nanoid(),
        parentId: doc.parentId || _id,
        ptrStatus: PTR_STATUSES.UNKNOWN,
        sumDt:
          doc.side === TR_SIDES.DEBIT
            ? doc.details.reduce((sum, cur) => sum + cur.amount, 0)
            : 0,
        sumCt:
          doc.side === TR_SIDES.CREDIT
            ? doc.details.reduce((sum, cur) => sum + cur.amount, 0)
            : 0,
        createdBy: userId,
        createdAt: new Date(),
      };

      const newTr = await models.Transactions.create({ ...lastDoc });
      newTr.ptrStatus = await this.checkPtr(newTr.ptrId);

      return newTr;
    }

    /**
     * Update a one transaction
     */
    public static async updateTransaction(
      _id: string,
      doc: ITransaction,
      userId: string,
    ) {
      const oldTr = await models.Transactions.getTransaction({ _id });

      doc.fullDate = getFullDate(doc.date);
      await models.Transactions.updateOne(
        { _id },
        {
          $set: {
            ...doc,
            parentId: doc.parentId || _id,
            sumDt:
              doc.side === TR_SIDES.DEBIT
                ? doc.details.reduce((sum, cur) => sum + cur.amount, 0)
                : 0,
            sumCt:
              doc.side === TR_SIDES.CREDIT
                ? doc.details.reduce((sum, cur) => sum + cur.amount, 0)
                : 0,
            modifiedBy: userId,
            updatedAt: new Date(),
          },
        },
      );
      await this.checkPtr(oldTr.ptrId);

      return await models.Transactions.findOne({ _id }).lean();
    }

    public static async linkTransaction(_ids: string[], ptrId?: string) {
      if (!ptrId) {
        ptrId = nanoid();
      }
      await models.Transactions.updateMany(
        { _id: { $in: _ids } },
        { $set: { ptrId } },
      );
      await this.checkPtr(ptrId);
      return models.Transactions.find({ ptrId });
    }

    /**
     * Create a perfect transactions
     */
    public static async createPTransaction(
      docs: ITransaction[],
      userId: string,
      options: { skipAccountPermission?: boolean } = {},
    ) {
      docs = normalizeParentWorkflowDocs(docs, userId);
      if (!options.skipAccountPermission) {
        await assertCanWriteTransactionAccounts({ models, docs, userId });
      }

      const transactions: ITransactionDocument[] = [];
      let errMsg = '';

      const session = await connection.startSession();
      session.startTransaction();
      try {
        const ptrId = nanoid();
        let parentId = '';
        let ptrNumber = '';

        for (const doc of docs) {
          const cleanDoc = cleanCreatePTransactionDoc(doc);

          if (!parentId) {
            const firstTrs = await commonSave(subdomain, models, userId, {
              ...cleanDoc,
              ptrId,
            });
            parentId = firstTrs.mainTr.parentId;
            ptrNumber = await this.getPtrNumber(firstTrs.mainTr);
            transactions.push(firstTrs.mainTr);

            if (firstTrs.otherTrs?.length) {
              await models.Transactions.updateMany(
                {
                  _id: { $in: firstTrs.otherTrs.map((ot) => ot._id) },
                  $or: [
                    { number: { $exists: false } },
                    { number: null },
                    { number: '' },
                  ],
                },
                { $set: { number: ptrNumber } },
              );

              for (const otherTr of firstTrs.otherTrs) {
                transactions.push(otherTr);
              }
            }
          } else {
            const trs = await commonSave(subdomain, models, userId, {
              ...cleanDoc,
              ptrId,
              parentId,
              number: cleanDoc.number ?? ptrNumber,
              ptrNumber,
            });
            transactions.push(trs.mainTr);
            if (trs.otherTrs?.length) {
              for (const otherTr of trs.otherTrs) {
                transactions.push(otherTr);
              }
            }
          }
        }

        await this.syncParentWorkflowIdentifiers(parentId, ptrNumber);
        await setPtrStatus(models, transactions);

        await session.commitTransaction();

        sendDbEventLog({
          action: 'create',
          docId: parentId,
          currentDocument: transactions,
        });

        const activityLog = generateTrStatusActivityLog({
          parentId,
          userId,
          status: transactions[0]?.status,
          mentionOwnerId: transactions[0]?.mentionOwnerId,
          mentionUserIds: transactions[0]?.mentionUserIds,
        });

        if (activityLog) {
          createActivityLog(activityLog);
        }

        publishTransactionChanged({
          subdomain,
          parentId,
          action: 'created',
          transaction: transactions[0],
          transactions,
        });
      } catch (e) {
        errMsg = e.message;
        await session.abortTransaction();
      } finally {
        session.endSession();
      }

      if (errMsg) {
        throw new Error(errMsg);
      }

      return transactions;
    }

    /**
     * Create a perfect transactions
     */
    public static async updatePTransaction(
      parentId: string,
      docs: (ITransaction & { _id?: string })[],
      userId: string,
      options: { skipAccountPermission?: boolean } = {},
    ) {
      const oldTrs = await models.Transactions.find({
        parentId,
        $or: [{ originId: { $exists: false } }, { originId: { $eq: '' } }],
      }).lean();
      if (!oldTrs.length) {
        throw new Error('Not found old transactions');
      }

      const {
        ptrId,
        status: oldStatus,
        mentionOwnerId: oldMentOwnerId,
        mentionUserIds: oldMentUserIds,
      } = oldTrs[0];

      if (!ptrId) {
        throw new Error('Not found old transactions ptr');
      }

      const ptrNumber =
        oldTrs[0].ptrNumber || (await this.getPtrNumber(oldTrs[0]));

      docs = normalizeParentWorkflowDocs(docs, userId, oldTrs[0]);
      if (!options.skipAccountPermission) {
        await assertCanWriteTransactionAccounts({
          models,
          docs,
          userId,
          oldTrs,
        });
      }

      const oldTrIds = oldTrs.map((ot) => ot._id);

      const addTrDocs: ITransaction[] = [];
      const editTrDocs: ITransaction[] = [];

      for (const doc of docs) {
        delete doc.ptrNumber;
        if (oldTrIds.includes(doc._id || '')) {
          editTrDocs.push(doc);
        } else {
          addTrDocs.push(doc);
        }
      }

      const editTrIds = editTrDocs.map((itd) => itd._id);
      const deleteTrs: ITransaction[] = oldTrs.filter(
        (otr) => !editTrIds.includes(otr._id),
      );

      const transactions: ITransactionDocument[] = [];
      let errMsg = '';

      const session = await connection.startSession();
      session.startTransaction();
      try {
        for (const doc of editTrDocs) {
          const trs = await commonSave(
            subdomain,
            models,
            userId,
            { ...doc, ptrId, parentId, ptrNumber },
            oldTrs.find((ot) => ot._id === doc._id),
          );
          transactions.push(trs.mainTr);
          if (trs.otherTrs?.length) {
            for (const otherTr of trs.otherTrs) {
              transactions.push(otherTr);
            }
          }
        }

        for (const doc of addTrDocs) {
          const trs = await commonSave(subdomain, models, userId, {
            ...doc,
            ptrId,
            parentId,
            ptrNumber,
          });
          transactions.push(trs.mainTr);
          if (trs.otherTrs?.length) {
            for (const otherTr of trs.otherTrs) {
              transactions.push(otherTr);
            }
          }
        }

        for (const tr of deleteTrs) {
          await models.Transactions.deleteMany({
            $or: [{ _id: tr._id }, { originId: tr._id }],
          });
        }

        await this.syncParentWorkflowIdentifiers(parentId, ptrNumber);
        await setPtrStatus(models, transactions);

        await session.commitTransaction();

        sendDbEventLog({
          action: 'update',
          docId: parentId,
          currentDocument: transactions,
          prevDocument: oldTrs,
        });

        const activityLog = generateTrStatusActivityLog({
          parentId,
          userId,
          status: transactions[0]?.status,
          mentionOwnerId: transactions[0]?.mentionOwnerId,
          mentionUserIds: transactions[0]?.mentionUserIds,
          oldStatus,
          oldMentionOwnerId: oldMentOwnerId,
          oldMentionUserIds: oldMentUserIds,
        });

        if (activityLog) {
          createActivityLog(activityLog);
        }

        publishTransactionChanged({
          subdomain,
          parentId,
          action: 'updated',
          transaction: transactions[0],
          oldTransaction: oldTrs[0],
          transactions,
          oldTransactions: oldTrs,
        });
      } catch (e) {
        errMsg = e.message;
        await session.abortTransaction();
      } finally {
        session.endSession();
      }

      if (errMsg) {
        throw new Error(errMsg);
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
        throw new Error(
          "can't remove this transaction. Remove the source transaction first",
        );
      }

      if ((await models.Transactions.find({ preTrId: _id }).lean()).length) {
        throw new Error(
          "can't remove this transaction. Remove the dependent transaction first",
        );
      }

      await commonRemove(subdomain, models, transaction);
      await models.Transactions.deleteMany({
        $or: [{ _id }, { originId: _id }],
      });

      return 'success';
    }

    public static async removePTransaction({
      parentId,
      ptrId,
    }: {
      parentId?: string;
      ptrId?: string;
    }) {
      const $or: any = [];
      if (parentId) {
        $or.push({ parentId });
      }
      if (ptrId) {
        $or.push({ ptrId });
      }

      if (!$or.length) {
        throw new Error('less params');
      }

      const trsOfPtr = await models.Transactions.find({ $or }).lean();
      const parentIds = [...new Set(trsOfPtr.map((tr) => tr.parentId))];
      const ptrIds = [...new Set(trsOfPtr.map((tr) => tr.ptrId))];

      const summaryTrs = await models.Transactions.find({
        $or: [{ parentId: { $in: parentIds } }, { ptrId: { $in: ptrIds } }],
      }).lean();
      const deleteTrIds = summaryTrs.map((tr) => tr._id);

      if (
        (
          await models.Transactions.find({
            preTrId: { $in: deleteTrIds },
            _id: { $nin: deleteTrIds },
          }).lean()
        ).length
      ) {
        throw new Error(
          "can't remove this transaction. Remove the dependent transaction first",
        );
      }
      if (
        !(
          await models.Transactions.find({
            _id: { $in: deleteTrIds },
          }).lean()
        ).length
      ) {
        throw new Error('not found trs');
      }

      for (const tr of summaryTrs) {
        await commonRemove(subdomain, models, tr);
      }

      const response = await models.Transactions.deleteMany({
        _id: { $in: deleteTrIds },
      });

      sendDbEventLog({
        action: 'deleteMany',
        docIds: parentIds,
      });

      publishTransactionChanged({
        subdomain,
        action: 'removed',
        oldTransactions: summaryTrs,
      });

      for (const removedParentId of parentIds) {
        const removedParentTrs = summaryTrs.filter(
          (tr) => tr.parentId === removedParentId,
        );

        publishTransactionChanged({
          subdomain,
          parentId: removedParentId,
          action: 'removed',
          oldTransaction: removedParentTrs[0],
          oldTransactions: removedParentTrs,
          publishGlobal: false,
        });
      }

      return response;
    }
  }

  transactionSchema.loadClass(Transaction);

  return transactionSchema;
};
