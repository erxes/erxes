import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import {
  SAFE_REMAINDER_ITEM_STATUSES,
  SAFE_REMAINDER_STATUSES,
} from '~/modules/inventories/@types/constants';

const safeRemainderItemMutations = {
  async safeRemainderItemEdit(
    _root: any,
    params: {
      _id: string;
      status?: string;
      remainder: number;
      trInfo?: any;
    },
    { models, user }: IContext,
  ) {
    const { _id, status, remainder, trInfo } = params;

    const doc = {
      count: remainder,
      status: status || SAFE_REMAINDER_ITEM_STATUSES.CHECKED,
      trInfo,
    };

    return await models.SafeRemainderItems.updateItem(_id, doc, user._id);
  },

  async safeRemainderItemsBulkEdit(
    _root: any,
    {
      safeRemainderId,
      productsData,
      duplicateRule = 'last',
    }: {
      safeRemainderId: string;
      productsData: { productCode: string; count: number }[];
      duplicateRule?: 'skip' | 'last' | 'add';
    },
    { models, subdomain, user }: IContext,
  ) {
    const safeRemainder = await models.SafeRemainders.getRemainder(
      safeRemainderId,
    );
    if (safeRemainder.status === SAFE_REMAINDER_STATUSES.PUBLISHED) {
      throw new Error('Cant edit cause remainder has submitted');
    }

    const merged: Record<string, number> = {};
    for (const item of productsData) {
      const existing = merged[item.productCode];
      if (existing === undefined) {
        merged[item.productCode] = item.count;
      } else if (duplicateRule === 'last') {
        merged[item.productCode] = item.count;
      } else if (duplicateRule === 'add') {
        merged[item.productCode] = existing + item.count;
      }
    }

    const productCodes = Object.keys(merged);

    const products = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      module: 'products',
      action: 'find',
      input: {
        query: { code: { $in: productCodes } },
        fields: { _id: 1, code: 1, uom: 1 },
      },
      defaultValue: [],
    });

    const codeToProduct: Record<string, any> = {};
    for (const p of products) {
      codeToProduct[p.code] = p;
    }

    const bulkOps = productCodes.flatMap((code) => {
      const product = codeToProduct[code];
      if (!product) return [];

      const setOnInsert = {
        remainderId: safeRemainderId,
        productId: product._id,
        branchId: safeRemainder.branchId,
        departmentId: safeRemainder.departmentId,
        uom: product.uom,
        preCount: 0,
      };

      if (duplicateRule === 'skip') {
        return [
          {
            updateOne: {
              filter: { remainderId: safeRemainderId, productId: product._id },
              update: {
                $setOnInsert: {
                  ...setOnInsert,
                  count: merged[code],
                  status: SAFE_REMAINDER_ITEM_STATUSES.CHECKED,
                  modifiedAt: new Date(),
                  modifiedBy: user._id,
                },
              },
              upsert: true,
            },
          },
        ];
      }

      if (duplicateRule === 'add') {
        return [
          {
            updateOne: {
              filter: { remainderId: safeRemainderId, productId: product._id },
              update: {
                $inc: { count: merged[code] },
                $set: {
                  status: SAFE_REMAINDER_ITEM_STATUSES.CHECKED,
                  modifiedAt: new Date(),
                  modifiedBy: user._id,
                },
                $setOnInsert: setOnInsert,
              },
              upsert: true,
            },
          },
        ];
      }

      return [
        {
          updateOne: {
            filter: { remainderId: safeRemainderId, productId: product._id },
            update: {
              $set: {
                count: merged[code],
                status: SAFE_REMAINDER_ITEM_STATUSES.CHECKED,
                modifiedAt: new Date(),
                modifiedBy: user._id,
              },
              $setOnInsert: setOnInsert,
            },
            upsert: true,
          },
        },
      ];
    });

    if (!bulkOps.length) return 0;

    const result = await models.SafeRemainderItems.bulkWrite(bulkOps, {
      ordered: false,
    });
    return (result.modifiedCount ?? 0) + (result.upsertedCount ?? 0);
  },

  async safeRemainderItemsRemove(
    _root: any,
    { ids }: { ids: string[] },
    { models }: IContext,
  ) {
    return models.SafeRemainderItems.removeItems(ids);
  },
};

export default safeRemainderItemMutations;
