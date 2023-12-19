const https = require('http');
import * as fs from 'fs';
import { Model } from 'mongoose';
import * as _ from 'underscore';
import * as xlsxPopulate from 'xlsx-populate';
import { IModels } from '../connectionResolver';
import { sendProductsMessage } from '../messageBroker';
import {
  SAFE_REMAINDER_ITEM_STATUSES,
  SAFE_REMAINDER_STATUSES
} from './definitions/constants';
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
        productCategoryId,
        attachment,
        filterField
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
        modifiedBy: userId
      });

      let productFilter = {};
      const attachDatas: any = {};
      let attachFieldId = '';

      if (attachment && attachment.url) {
        const filePath = `src/private/uploads/${attachment.url}`;

        const url = `http://localhost:3300/read-file?key=${attachment.url}`;
        const file = fs.createWriteStream(`${filePath}`);

        await new Promise((resolve, reject) => {
          https.get(url, res => {
            resolve(res.pipe(file));
          });
        });

        await xlsxPopulate.fromFileAsync(`${filePath}`).then(workbook => {
          let row = 1;
          let checkVal = 'begin';
          while (checkVal) {
            row++;
            const cella = workbook.sheet(0).cell(`A${row}`);
            const cellb = workbook.sheet(0).cell(`B${row}`);
            checkVal = cella.value() || cellb.value();

            if (!checkVal) {
              continue;
            }

            const valb =
              String(
                workbook
                  .sheet(0)
                  .cell(`B${row}`)
                  .value()
              ) || '';
            const valc =
              workbook
                .sheet(0)
                .cell(`C${row}`)
                .value() || 0;
            const vald =
              workbook
                .sheet(0)
                .cell(`D${row}`)
                .value() || 0;

            if (valb) {
              if (!Object.keys(attachDatas).includes(valb)) {
                attachDatas[valb] = {
                  changeCount: 0,
                  lastCount: 0
                };
              }

              attachDatas[valb].changeCount += Number(valc);
              attachDatas[valb].lastCount = Number(vald);
            }
          }
        });

        if (filterField.includes('customFieldsData')) {
          attachFieldId = filterField.split('.')[1];
          productFilter = {
            query: {
              $and: [
                { 'customFieldsData.field': attachFieldId },
                { 'customFieldsData.value': { $in: Object.keys(attachDatas) } }
              ]
            }
          };
        } else {
          productFilter = {
            query: { [filterField]: { $in: Object.keys(attachDatas) } }
          };
        }
        fs.unlink(filePath, () => {});
      } else {
        productFilter = {
          categoryId: productCategoryId,
          query: { status: { $ne: 'deleted' } }
        };
      }

      // Get products related to product category
      const limit = await sendProductsMessage({
        subdomain,
        action: 'count',
        data: {
          ...productFilter
        },
        isRPC: true
      });

      const products: any = await sendProductsMessage({
        subdomain,
        action: 'find',
        data: {
          ...productFilter,
          sort: { code: 1 },
          limit
        },
        isRPC: true
      });

      // Create remainder items for every product
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
      let order = 0;

      for (const product of products) {
        order++;
        const live = liveRemByProductId[product._id] || {};
        let count = live.count || 0;
        if (attachment && attachment.url) {
          const datasKey = String(
            attachFieldId
              ? product.customFieldsData.find(
                  cfd => cfd.field === attachFieldId
                )?.value
              : product[filterField]
          );
          const { lastCount, changeCount } = attachDatas[datasKey];

          if (changeCount) {
            count = count + changeCount;
          } else {
            count = lastCount;
          }
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
          order
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
