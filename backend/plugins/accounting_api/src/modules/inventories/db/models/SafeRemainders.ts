import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import {
  SAFE_REMAINDER_STATUSES,
  SAFE_REMAINDER_ITEM_STATUSES,
} from '../../@types/constants';
import {
  ISafeRemainderDocument,
  ISafeRemainder,
  ISafeRemEditFields,
} from '../../@types/safeRemainders';
import { safeRemainderSchema } from '../definitions/safeRemainders';
import { sendTRPCMessage } from 'erxes-api-shared/utils';

export interface ISafeRemainderModel extends Model<ISafeRemainderDocument> {
  getRemainder(_id: string): Promise<ISafeRemainderDocument>;
  createRemainder(
    subdomain: string,
    params: ISafeRemainder,
    userId: string,
  ): Promise<ISafeRemainderDocument>;
  updateRemainder(
    subdomain: string,
    params: ISafeRemEditFields & { _id: string },
    userId: string,
  ): Promise<ISafeRemainderDocument>;
  removeRemainder(_id: string): void;
}

export const loadSafeRemainderClass = (models: IModels, _subdomain: string) => {
  class SafeRemainder {
    /**
     * Get safe remainder
     * @param _id Safe remainder ID
     * @returns Found object
     */
    public static async getRemainder(_id: string) {
      const result: any = await models.SafeRemainders.findOne({ _id });

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
      userId: string,
    ) {
      const {
        branchId,
        departmentId,
        date,
        description,
        productCategoryId,
        attachment,
        items,
      } = params;

      // Create new safe remainder
      const safeRemainder: any = await models.SafeRemainders.create({
        date,
        description,
        departmentId,
        branchId,
        productCategoryId,
        attachment,
        status: SAFE_REMAINDER_STATUSES.DRAFT,
        createdAt: new Date(),
        createdBy: userId,
        modifiedAt: new Date(),
        modifiedBy: userId,
      });

      let productFilter: any = {};

      if (items?.length) {
        const codes: string[] = items.map((i) => i.code);
        productFilter = { query: { code: { $in: codes } } };
      } else {
        productFilter = {
          query: { status: { $ne: 'deleted' } },
        };

        if (productCategoryId) {
          productFilter.categoryId = productCategoryId;
        }
      }
      // Get products related to product category
      const products = await sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        module: 'products',
        action: 'find',
        input: {
          ...productFilter,
          fields: { _id: 1, [`inventories.${branchId}.${departmentId}`]: 1 },
          sort: { code: 1 },
        },
        defaultValue: [],
      });

      const bulkOps: any[] = [];
      let order = 0;

      for (const product of products) {
        order++;
        console.log(product);
        const preCount =
          product.inventories?.[branchId]?.[departmentId]?.remainder ?? 0;
        let count = preCount;

        if (items?.length) {
          count = items.find((i) => i.code === product.code)?.remainder || 0;
        }

        bulkOps.push({
          remainderId: safeRemainder._id,
          branchId: safeRemainder.branchId,
          departmentId: safeRemainder.departmentId,
          productId: product._id,
          preCount: preCount ?? 0,
          count,
          status: SAFE_REMAINDER_ITEM_STATUSES.NEW,
          uom: product.uom,
          modifiedAt: new Date(),
          modifiedBy: userId,
          order,
        });
      }

      await models.SafeRemainderItems.insertMany(bulkOps);

      return safeRemainder;
    }

    /**
     * update some fields safe remainder
     * @param _id Safe remainder ID
     * @returns updated response
     */
    public static async updateRemainder(
      _subdomain: string,
      params: ISafeRemEditFields & { _id: string },
      userId: string,
    ) {
      const { _id, description, incomeRule, outRule, saleRule } = params;
      const safeRemainder = await models.SafeRemainders.getRemainder(_id);

      if (safeRemainder.status === SAFE_REMAINDER_STATUSES.PUBLISHED) {
        throw new Error('Can`t edit: cause published');
      }

      await models.SafeRemainders.updateOne(
        { _id },
        {
          $set: {
            description,
            incomeRule: { ...safeRemainder.incomeRule, ...incomeRule },
            outRule: { ...safeRemainder.outRule, ...outRule },
            saleRule: { ...safeRemainder.saleRule, ...saleRule },
            modifiedBy: userId,
          },
        },
      );
      return await models.SafeRemainders.getRemainder(_id);
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
