import { IUserDocument } from '@erxes/api-utils/src/types';
import { Model } from 'mongoose';
import * as _ from 'underscore';
import { IModels, IContext } from '../connectionResolver';
import { sendProductsMessage } from '../messageBroker';
import { SAFE_REMAINDER_STATUSES } from './definitions/constants';
import {
  ISafeRemainder,
  ISafeRemainderDocument,
  safeRemainderSchema
} from './definitions/safeRemainders';

export interface ISafeRemainderModel extends Model<ISafeRemainderDocument> {
  getRemainder(_id: string): Promise<ISafeRemainderDocument>;
  createRemainder(
    subdomain: string,
    params: ISafeRemainder,
    userId: string
  ): Promise<ISafeRemainderDocument>;
  updateRemainder(
    _id: string,
    doc: ISafeRemainderDocument,
    userId: string
  ): Promise<ISafeRemainderDocument>;
  removeRemainder(_id: string): void;
}

export const loadSafeRemainderClass = (models: IModels) => {
  class SafeRemainder {
    /**
     * Get safe remainder
     * @param _id Safe remainder ID
     * @returns Found object
     */
    public static async getRemainder(_id: string) {
      const result: any = await models.SafeRemainders.findById(_id);

      if (!result) throw new Error('Safe remainder not found!');

      return result;
    }

    /**
     * Create safe remainder
     * @param subdomain
     * @param params New data to create
     * @param user Interacted user details
     * @returns Created response
     */
    public static async createRemainder(
      subdomain: string,
      params: ISafeRemainder,
      userId: string
    ) {
      const {
        date,
        description,
        departmentId,
        branchId,
        productCategoryId
      } = params;

      // Create new safe remainder
      const safeRemainder: any = await models.SafeRemainders.create({
        date,
        description,
        departmentId,
        branchId,
        productCategoryId,
        status: SAFE_REMAINDER_STATUSES.DRAFT,
        createdAt: new Date(),
        createdBy: userId,
        modifiedAt: new Date(),
        modifiedBy: userId
      });

      // Get products related to product category
      const products: any = await sendProductsMessage({
        subdomain,
        action: 'find',
        data: {
          query: { categoryId: productCategoryId },
          sort: {}
        },
        isRPC: true
      });

      // Create remainder items for every product
      const defaultUomId = '';
      const productIds = products.map((item: any) => item._id);
      const liveRemainders = await models.Remainders.find({
        departmentId,
        branchId,
        productId: { $in: productIds }
      }).lean();

      const bulkOps: any[] = [];

      for (const product of products) {
        const live =
          liveRemainders.find((remainder: any) => {
            remainder.productId === product._id;
          }) || {};

        bulkOps.push({
          remainderId: safeRemainder._id,
          branchId: safeRemainder.branchId,
          departmentId: safeRemainder.departmentId,
          productId: product._id,
          preCount: live.count || 0,
          count: live.count || 0,

          uomId: product.uomId || defaultUomId,
          lastTransactionDate: new Date(),

          modifiedAt: new Date(),
          modifiedBy: userId
        });
      }

      await models.SafeRemainderItems.insertMany(bulkOps);

      return safeRemainder;
    }

    /**
     * Update safe remainder
     * @param _id Safe remainder ID
     * @param doc New data to update
     * @returns Updated object
     */
    public static async updateRemainder(
      _id: string,
      doc: ISafeRemainder,
      userId: string
    ) {
      await models.SafeRemainders.findByIdAndUpdate(_id, {
        $set: {
          ...doc,
          modifiedAt: new Date(),
          modifiedBy: userId
        }
      });
      return await this.getRemainder(_id);
    }

    /**
     * Delete safe remainder
     * @param _id Safe remainder ID
     * @returns Delelted response
     */
    public static async removeRemainder(_id: string) {
      return await models.SafeRemainders.findByIdAndDelete(_id);
    }
  }

  safeRemainderSchema.loadClass(SafeRemainder);

  return safeRemainderSchema;
};
