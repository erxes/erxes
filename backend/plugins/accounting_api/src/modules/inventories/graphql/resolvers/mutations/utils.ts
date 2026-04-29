import { IUserDocument } from 'erxes-api-shared/core-types';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { nanoid } from 'nanoid';
import { IModels } from '~/connectionResolvers';
import { ADJ_INV_STATUSES } from '~/modules/accounting/@types/adjustInventory';
import {
  ACCOUNT_JOURNALS,
  TR_SIDES,
} from '~/modules/accounting/@types/constants';
import {
  ITransaction,
  ITransactionDocument,
  ITrDetail,
} from '~/modules/accounting/@types/transaction';
import { SAFE_REMAINDER_ITEM_STATUSES } from '~/modules/inventories/@types/constants';
import {
  ISafeRemainderDocument,
  IUpdateRemaindersParams,
} from '~/modules/inventories/@types/safeRemainders';

export const setSafeRemItems = async (
  subdomain: string,
  models: IModels,
  safeRemainder: ISafeRemainderDocument,
  userId: string,
) => {
  let productFilter: any = {};
  const { productCategoryId, branchId, departmentId } = safeRemainder;

  productFilter = {
    query: { status: { $ne: 'deleted' } },
  };

  if (productCategoryId) {
    productFilter.categoryId = productCategoryId;
  }

  // Get products related to product category
  const products = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    module: 'products',
    action: 'find',
    input: {
      ...productFilter,
      fields: {
        _id: 1,
        uom: 1,
        code: 1,
        [`inventories.${branchId}.${departmentId}`]: 1,
      },
      sort: { code: 1 },
    },
    defaultValue: [],
  });

  let bulkOps: any[] = [];
  let order = 0;

  // Get product ids
  const allProductIds = products.map((item: any) => item._id);
  const inventoryByProductId: {
    [productId: string]: { remainder: number; cost: number };
  } = {};
  const invAccountIds = (
    await models.Accounts.find({
      journal: { $in: ACCOUNT_JOURNALS.INVENTORY },
    }).lean()
  ).map((acc) => acc._id);

  const trFilter: any = {
    branchId,
    departmentId,
    'details.accountId': { $in: invAccountIds },
    'details.productId': { $in: allProductIds },
    date: { $lte: safeRemainder.date },
  };

  const lastAdjInv = await models.AdjustInventories.findOne({
    status: ADJ_INV_STATUSES.PUBLISH,
  })
    .sort({ date: -1 })
    .lean();

  if (lastAdjInv) {
    trFilter.date.$gt = lastAdjInv.date;
    const lastConfigedDetails = await models.AdjustInvDetails.find({
      adjustId: lastAdjInv._id,
      branchId,
      departmentId,
      productId: { $in: allProductIds },
    }).lean();

    for (const lastDet of lastConfigedDetails) {
      if (!inventoryByProductId[lastDet.productId]) {
        inventoryByProductId[lastDet.productId] = { remainder: 0, cost: 0 };
      }
      inventoryByProductId[lastDet.productId]['remainder'] =
        (inventoryByProductId[lastDet.productId]?.['remainder'] ?? 0) +
        lastDet.remainder;
      inventoryByProductId[lastDet.productId]['cost'] =
        (inventoryByProductId[lastDet.productId]?.['cost'] ?? 0) + lastDet.cost;
    }
  }

  const trDetails = await models.Transactions.aggregate([
    { $match: trFilter },
    { $unwind: '$details' },
    { $match: { 'details.productId': { $in: allProductIds } } },
    { $sort: { date: 1 } },
    { $project: { details: 1 } },
  ]);

  for (const trDet of trDetails) {
    const { details } = trDet;
    const { productId, count, side, amount } = details;
    const multiplier = side === TR_SIDES.CREDIT ? -1 : 1;

    if (!inventoryByProductId[productId]) {
      inventoryByProductId[productId] = { remainder: 0, cost: 0 };
    }
    inventoryByProductId[productId]['remainder'] =
      (inventoryByProductId[productId]?.['remainder'] ?? 0) +
      multiplier * count;
    inventoryByProductId[productId]['cost'] =
      (inventoryByProductId[productId]?.['cost'] ?? 0) + multiplier * amount;
  }

  for (const product of products) {
    order++;
    const productId = product._id;
    const newInfo = inventoryByProductId[productId] ?? {
      remainder: 0,
      cost: 0,
    };

    bulkOps.push({
      updateOne: {
        filter: {
          remainderId: safeRemainder._id,
          productId: product._id,
        },
        update: [
          {
            $set: {
              _id: { $ifNull: ['$_id', nanoid()] },
              remainderId: { $ifNull: ['$remainderId', safeRemainder._id] },
              productId: { $ifNull: ['$productId', product._id] },
              status: {
                $ifNull: ['$status', SAFE_REMAINDER_ITEM_STATUSES.NEW],
              },
              uom: { $ifNull: ['$uom', product.uom] },

              preCount: newInfo.remainder,
              cost: newInfo.cost,
              modifiedAt: new Date(),
              modifiedBy: userId,
              order,

              count: {
                $cond: [
                  {
                    $or: [
                      { $not: [{ $ifNull: ['$count', false] }] },
                      {
                        $and: [
                          {
                            $eq: ['$status', SAFE_REMAINDER_ITEM_STATUSES.NEW],
                          },
                          { $eq: ['$preCount', '$count'] },
                        ],
                      },
                    ],
                  },
                  newInfo.remainder,
                  '$count',
                ],
              },
            },
          },
        ],
        upsert: true,
      },
    });

    if (bulkOps.length >= 1000) {
      await models.SafeRemainderItems.bulkWrite(bulkOps, { ordered: false });
      bulkOps = [];
    }
  }

  if (bulkOps.length) {
    await models.SafeRemainderItems.bulkWrite(bulkOps, { ordered: false });
  }
};

export const safeRemainderDoTrs = async (
  models: IModels,
  {
    safeRemainder,
    details,
    journal,
    oldMainTr,
    otherTrs,
    user,
    followInfos,
  }: {
    safeRemainder: ISafeRemainderDocument;
    details: ITrDetail[];
    journal: string;
    oldMainTr?: ITransactionDocument;
    otherTrs?: ITransactionDocument[];
    user: IUserDocument;
    followInfos?: any;
  },
) => {
  if (!oldMainTr && !details.length) {
    return;
  }

  if (oldMainTr && !details.length) {
    // remove
    await models.Transactions.removePTransaction({
      parentId: oldMainTr.parentId,
    });
    return;
  }

  const transactionDoc: ITransaction = {
    date: safeRemainder.date,
    journal,
    branchId: safeRemainder.branchId,
    departmentId: safeRemainder.departmentId,
    description: 'Census',
    contentType: 'safeRem',
    contentId: safeRemainder._id,
    details,
    followInfos,
  };

  if (!oldMainTr) {
    // create
    const mainTrId = nanoid();
    await models.Transactions.createPTransaction(
      [{ ...transactionDoc, _id: mainTrId }],
      user._id,
    );
    return mainTrId;
  }

  // update
  await models.Transactions.updatePTransaction(
    oldMainTr.parentId,
    [{ ...oldMainTr, ...transactionDoc }, ...(otherTrs ?? [])],
    user._id,
  );
  return oldMainTr._id;
};

export const safeRemainderUndoTrs = async (models: IModels, trId?: string) => {
  if (!trId) {
    return;
  }
  const tr = await models.Transactions.findOne({ _id: trId }).lean();
  if (!tr) {
    return;
  }

  await models.Transactions.removePTransaction({ parentId: tr.parentId });
};

export const updateLiveRemainders = async ({
  subdomain,
  models,
  departmentId,
  branchId,
  productCategoryId,
  productIds,
}: IUpdateRemaindersParams & { subdomain: string; models: IModels }) => {
  const productFilter: any = { status: { $ne: 'deleted' } };
  if (productIds?.length) {
    productFilter._id = { $in: productIds };
  }

  // Find all products in category by categoryId
  const products = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    module: 'products',
    action: 'find',
    input: {
      query: productFilter,
      categoryId: productCategoryId,
      fields: { _id: 1, [`inventories.${branchId}.${departmentId}`]: 1 },
      sort: { code: 1 },
    },
    defaultValue: []
  });

  // Get product ids
  const allProductIds = products.map((item: any) => item._id);
  const inventoryByProductId: {
    [productId: string]: { remainder: number; cost: number };
  } = {};
  const invAccountIds = (
    await models.Accounts.find({
      journal: { $in: ACCOUNT_JOURNALS.INVENTORY },
    }).lean()
  ).map((acc) => acc._id);

  const trFilter: any = {
    branchId,
    departmentId,
    'details.accountId': { $in: invAccountIds },
    'details.productId': { $in: allProductIds },
  };

  const lastAdjInv = await models.AdjustInventories.findOne({
    status: ADJ_INV_STATUSES.PUBLISH,
  })
    .sort({ date: -1 })
    .lean();

  if (lastAdjInv) {
    trFilter.date = { $gt: lastAdjInv.date };
    const lastConfigedDetails = await models.AdjustInvDetails.find({
      adjustId: lastAdjInv._id,
      branchId,
      departmentId,
      productId: { $in: allProductIds },
    }).lean();

    for (const lastDet of lastConfigedDetails) {
      if (!inventoryByProductId[lastDet.productId]) {
        inventoryByProductId[lastDet.productId] = { remainder: 0, cost: 0 };
      }
      inventoryByProductId[lastDet.productId]['remainder'] =
        (inventoryByProductId[lastDet.productId]?.['remainder'] ?? 0) +
        lastDet.remainder;
      inventoryByProductId[lastDet.productId]['cost'] =
        (inventoryByProductId[lastDet.productId]?.['cost'] ?? 0) + lastDet.cost;
    }
  }

  const trDetails = await models.Transactions.aggregate([
    { $match: trFilter },
    { $unwind: '$details' },
    { $match: { 'details.productId': { $in: allProductIds } } },
    { $sort: { date: 1 } },
    { $project: { details: 1 } },
  ]);

  for (const trDet of trDetails) {
    const { details } = trDet;
    const { productId, count, side, amount } = details;
    const multiplier = side === TR_SIDES.CREDIT ? -1 : 1;

    if (!inventoryByProductId[productId]) {
      inventoryByProductId[productId] = { remainder: 0, cost: 0 };
    }
    inventoryByProductId[productId]['remainder'] =
      (inventoryByProductId[productId]?.['remainder'] ?? 0) +
      multiplier * count;
    inventoryByProductId[productId]['cost'] =
      (inventoryByProductId[productId]?.['cost'] ?? 0) + multiplier * amount;
  }

  let bulkOps: {
    productId: string;
    uom?: string;
    remainder?: number;
    cost?: number;
    soonIn?: number;
    soonOut?: number;
  }[] = [];

  for (const product of products) {
    const productId = product._id;
    const productRemainder =
      product.inventories?.[branchId]?.[departmentId]?.remainder ?? 0;
    const productCost =
      product.inventories?.[branchId]?.[departmentId]?.cost ?? 0;
    const newInfo = inventoryByProductId[productId] ?? {
      remainder: 0,
      cost: 0,
    };

    if (
      productRemainder === newInfo.remainder &&
      productCost === newInfo.cost
    ) {
      continue;
    }

    bulkOps.push({
      productId,
      remainder: newInfo.remainder,
      cost: newInfo.cost,
    });

    if (bulkOps.length >= 1000) {
      await sendTRPCMessage({
        subdomain,
        method: 'mutation',
        pluginName: 'core',
        module: 'products',
        action: 'setInventories',
        input: {
          branchId,
          departmentId,
          productsInfo: bulkOps,
        },
      });

      bulkOps = [];
    }
  }

  if (bulkOps.length) {
    await sendTRPCMessage({
      subdomain,
      method: 'mutation',
      pluginName: 'core',
      module: 'products',
      action: 'setInventories',
      input: {
        branchId,
        departmentId,
        productsInfo: bulkOps,
      },
    });
  }
};

export const getProducts = async (subdomain, productId, productCategoryId) => {
  let products: any[] = [];
  if (productId) {
    const product = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      module: 'products',
      action: 'find',
      input: { _id: productId },
    });
    products = [product];
  }

  if (productCategoryId) {
    products = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      module: 'products',
      action: 'products.find',
      input: {
        query: { status: { $nin: ['archived', 'deleted'] } },
        categoryId: productCategoryId,
        sort: { code: 1 },
      },
      defaultValue: [],
    });
  }

  const productIds = products.map((p) => p._id);

  return { products, productIds };
};
