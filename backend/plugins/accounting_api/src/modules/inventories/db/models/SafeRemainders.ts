import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import {
  SAFE_REMAINDER_STATUSES,
  SAFE_REMAINDER_ITEM_STATUSES,
} from '../../@types/constants';
import {
  ISafeRemainderDocument,
  ISafeRemainder,
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
      userId: string,
    ) {
      const {
        branchId,
        departmentId,
        date,
        description,
        productCategoryId,
        attachment,
        filterField,
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
      const attachDatas: any = {};
      let attachFieldId = '';

      if (attachment && attachment.url) {
      } else if (items?.length) {
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
      console.log(productFilter, 'rrrrrrrrrrrrrrrrrr');
      // Get products related to product category
      const products = await sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        module: 'products',
        action: 'find',
        input: {
          ...productFilter,
          sort: { code: 1 },
        },
        defaultValue: [],
      });

      console.log(products);
      // Create remainder items for every product
      const productIds = products.map((item: any) => item._id);

      const liveRemainders = await models.Remainders.find({
        departmentId,
        branchId,
        productId: { $in: productIds },
      }).lean();

      const liveRemByProductId = {};
      for (const rem of liveRemainders) {
        liveRemByProductId[rem.productId] = rem;
      }

      const bulkOps: any[] = [];
      let order = 0;

      for (const product of products) {
        order++;
        const live = liveRemByProductId[product._id] || {};
        let count = live.count || 0;
        if (attachment && attachment.url) {
          const datasKey = String(
            attachFieldId
              ? product.customFieldsData.find(
                  (cfd) => cfd.field === attachFieldId,
                )?.value
              : product[filterField],
          );
          const { lastCount, changeCount } = attachDatas[datasKey];

          if (changeCount) {
            count = count + changeCount;
          } else {
            count = lastCount;
          }
        }

        if (items?.length) {
          count = items.find((i) => i.code === product.code)?.remainder || 0;
        }

        bulkOps.push({
          remainderId: safeRemainder._id,
          branchId: safeRemainder.branchId,
          departmentId: safeRemainder.departmentId,
          productId: product._id,
          preCount: live.count || 0,
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
