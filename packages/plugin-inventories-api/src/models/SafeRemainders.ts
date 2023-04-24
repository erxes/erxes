import { paginate } from '@erxes/api-utils/src';
import { Model } from 'mongoose';
import * as _ from 'underscore';
import { IModels } from '../connectionResolver';
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
      params: any,
      userId: string
    ) {
      const {
        branchId,
        departmentId,
        date,
        description,
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
      const limit = await sendProductsMessage({
        subdomain,
        action: 'count',
        data: {
          categoryId: productCategoryId,
          query: { status: { $ne: 'deleted' } }
        },
        isRPC: true
      });

      const products: any = await sendProductsMessage({
        subdomain,
        action: 'find',
        data: {
          categoryId: productCategoryId,
          query: { status: { $ne: 'deleted' } },
          sort: {},
          limit
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

      const liveRemByProductId = {};
      for (const rem of liveRemainders) {
        liveRemByProductId[rem.productId] = rem;
      }

      const bulkOps: any[] = [];

      for (const product of products) {
        const live = liveRemByProductId[product._id] || {};

        bulkOps.push({
          remainderId: safeRemainder._id,
          branchId: safeRemainder.branchId,
          departmentId: safeRemainder.departmentId,
          productId: product._id,
          preCount: live.count || 0,
          count: live.count || 0,
          uomId: product.uomId || defaultUomId,
          modifiedAt: new Date(),
          modifiedBy: userId
        });
      }

      await models.SafeRemainderItems.insertMany(bulkOps);

      return safeRemainder;
    }

    /**
     * Delete safe remainder
     * @param _id Safe remainder ID
     * @returns Delelted response
     */
    public static async removeRemainder(_id: string) {
      const safeRemainder = await models.SafeRemainders.getRemainder(_id);

      if (safeRemainder.status === SAFE_REMAINDER_STATUSES.PUBLISHED) {
        throw new Error('cant remove: cause submited');
      }

      // Delete safe remainder items by safe remainder id
      await models.SafeRemainderItems.deleteMany({ remainderId: _id });

      return await models.SafeRemainders.deleteOne({ _id });
    }
  }

  safeRemainderSchema.loadClass(SafeRemainder);

  return safeRemainderSchema;
};
