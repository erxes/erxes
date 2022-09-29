import { Model } from 'mongoose';
import * as _ from 'underscore';
import { IModels } from '../connectionResolver';
import { sendProductsMessage } from '../messageBroker';
import {
  ITransactionCreateParams,
  ITransactionDocument,
  transactionSchema
} from './definitions/transactions';

export interface ITransactionModel extends Model<ITransactionDocument> {
  getTransaction(_id: string): Promise<ITransactionDocument>;
  getTransactionDetail(subdomain: string, _id: string): Promise<JSON>;
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
     * Get transaction detailed
     * @param _id Transaction ID
     * @returns Found object with array of transaction items
     */
    public static async getTransactionDetail(subdomain: string, _id: string) {
      const result: any = await models.Transactions.findById(_id);

      if (!result) throw new Error('Transaction not found!');

      let transactionItems: any =
        (await models.TransactionItems.find({ transactionId: _id })) || [];

      await Promise.all(
        transactionItems.map(async (item: any) => {
          const product: any = await sendProductsMessage({
            subdomain,
            action: 'findOne',
            data: { _id: item.productId },
            isRPC: true
          });

          item.product = product;

          return item;
        })
      );

      return {
        _id: result._id,
        branchId: result.branchId,
        departmentId: result.departmentId,
        contentType: result.contentType,
        contentId: result.contentId,
        status: result.status,
        createdAt: result.createdAt,
        transactionItems
      };
    }

    /**
     * Create transaction
     * @param params New data to create
     * @returns Created response
     */
    public static async createTransaction(params: ITransactionCreateParams) {
      const {
        departmentId,
        branchId,
        status,
        contentType,
        contentId,
        products
      } = params;

      const transaction = await models.Transactions.create({
        departmentId,
        branchId,
        status,
        contentType,
        contentId,
        createdAt: new Date()
      });

      const bulkOps: any[] = [];

      for await (const item of products) {
        const filter: any = { productId: item.productId };
        if (departmentId) filter.departmentId = departmentId;
        if (branchId) filter.branchId = branchId;

        const remainder: any = await models.Remainders.findOne(filter);

        if (!remainder) return new Error('Remainder not found!');

        const safeRemainderItem: any[] = await models.SafeRemainderItems.find(
          filter
        );

        if (!safeRemainderItem)
          return new Error('Safe remainder item not found!');

        await models.SafeRemainderItems.updateMany(filter, {
          $set: { preCount: item.count }
        });

        const result = await models.Remainders.updateRemainder(remainder._id, {
          count: item.isDebit ? item.count : -1 * item.count
        });

        if (!result) return new Error('Remainder update failed!');

        bulkOps.push({
          transactionId: transaction._id,
          productId: item.productId,
          count: item.count - item.preCount,
          uomId: item.uomId,
          isDebit: item.count - item.preCount > 0,

          modifiedAt: new Date()
        });
      }

      await models.TransactionItems.insertMany(bulkOps);

      return transaction;
    }
  }

  transactionSchema.loadClass(Transaction);

  return transactionSchema;
};
