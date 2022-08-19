import { Model } from 'mongoose';
import * as _ from 'underscore';
import { IModels } from '../connectionResolver';
import {
  ITransaction,
  ITransactionCreateParams,
  ITransactionDocument,
  transactionSchema
} from './definitions/transactions';
import { ITransactionItem } from './definitions/transactionItems';

export interface ITransactionModel extends Model<ITransactionDocument> {
  getTransaction(_id: string): Promise<ITransactionDocument>;
  createTransaction(
    params: ITransactionCreateParams
  ): Promise<ITransactionDocument>;
}

export const loadTransactionClass = (models: IModels) => {
  class Transaction {
    /**
     * Get transaction
     * @param _id Transaction ID
     * @returns Found object
     */
    public static async getTransaction(_id: string) {
      const result: any = await models.Transactions.findById(_id);

      if (!result) throw new Error('Transaction not found!');

      return result;
    }

    /**
     * Create transaction
     * @param params New data to create
     * @returns Created response
     */
    public static async createTransaction(params: ITransactionCreateParams) {
      const { status, contentType, contentId, products } = params;

      const transaction = await models.Transactions.create({
        status,
        contentType,
        contentId,
        createdAt: new Date()
      });

      const bulkOps: any[] = [];

      products.map(async (item: ITransactionItem) => {
        const filter: any = { productId: item.productId };
        if (item.departmentId) filter.departmentId = item.departmentId;
        if (item.branchId) filter.branchId = item.branchId;

        const remainder: any = await models.Remainders.findOne(filter);

        if (!remainder) throw new Error('Remainder not found!');

        const result = await models.Remainders.updateRemainder(remainder._id, {
          count: item.isDebit ? item.count : -1 * item.count
        });

        if (!result) throw new Error('Remainder update failed!');

        bulkOps.push({
          branchId: item.branchId,
          departmentId: item.departmentId,
          transactionId: result._id,
          productId: item.productId,
          count: item.count,
          uomId: item.uomId,
          isDebit: true,

          modifiedAt: new Date()
        });
      });

      await models.TransactionItems.insertMany(bulkOps);

      return transaction;
    }
  }

  transactionSchema.loadClass(Transaction);

  return transactionSchema;
};
