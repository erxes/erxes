import { IUserDocument } from 'erxes-api-shared/core-types';
import { fixNum, sendTRPCMessage } from 'erxes-api-shared/utils';
import { nanoid } from 'nanoid';
import { IModels } from '~/connectionResolvers';
import { ADJ_INV_STATUSES } from '~/modules/accounting/@types/adjustInventory';
import {
  ACCOUNT_JOURNALS,
  TR_INVENTORY_STATUS_TYPES,
  TR_SIDES,
  TR_STATUSES,
} from '~/modules/accounting/@types/constants';
import {
  ITransaction,
  ITransactionDocument,
  ITrDetail,
} from '~/modules/accounting/@types/transaction';
import { getLastIncomePrices } from '~/modules/accounting/utils/inventories';
import { SAFE_REMAINDER_ITEM_STATUSES } from '~/modules/inventories/@types/constants';
import {
  ISafeRemainderDocument,
  IUpdateRemaindersParams,
} from '~/modules/inventories/@types/safeRemainders';

type TInventoryInfo = {
  remainder: number;
  cost: number;
  soonIn: number;
  soonOut: number;
};

type TSafeRemainderProduct = {
  _id: string;
  code?: string;
  uom?: string;
};

const EMPTY_LOCATION_VALUES = [null, ''];

const inventoryKey = (id?: string) => id || '_';

const locationFilter = (field: 'branchId' | 'departmentId', id?: string) => {
  if (id && id !== '_') {
    return { [field]: id };
  }

  return { [field]: { $in: EMPTY_LOCATION_VALUES } };
};

const emptyInventoryInfo = (): TInventoryInfo => ({
  remainder: 0,
  cost: 0,
  soonIn: 0,
  soonOut: 0,
});

const getInventoryStatusType = (status?: string) => {
  if (TR_INVENTORY_STATUS_TYPES.REAL_STATUSES.includes(status || '')) {
    return TR_INVENTORY_STATUS_TYPES.REAL;
  }

  if (TR_INVENTORY_STATUS_TYPES.SOON_STATUSES.includes(status || '')) {
    return TR_INVENTORY_STATUS_TYPES.SOON;
  }

  return TR_INVENTORY_STATUS_TYPES.OMIT;
};

const ensureInventoryInfo = (
  inventoryByProductId: Record<string, TInventoryInfo>,
  productId: string,
) => {
  if (!inventoryByProductId[productId]) {
    inventoryByProductId[productId] = emptyInventoryInfo();
  }

  return inventoryByProductId[productId];
};

const applyTransactionDetailToInventory = (
  inventoryByProductId: Record<string, TInventoryInfo>,
  trDet: ITransactionDocument & { details: ITrDetail },
) => {
  const { details, side, status } = trDet;
  const { productId, count = 0, amount = 0 } = details;

  if (!productId) {
    return;
  }

  const statusType = getInventoryStatusType(status);

  if (statusType === TR_INVENTORY_STATUS_TYPES.OMIT) {
    return;
  }

  const multiplier = side === TR_SIDES.CREDIT ? -1 : 1;
  const inventory = ensureInventoryInfo(inventoryByProductId, productId);

  if (statusType === TR_INVENTORY_STATUS_TYPES.REAL) {
    inventory.remainder += multiplier * count;
    inventory.cost += multiplier * amount;
    return;
  }

  if (side === TR_SIDES.CREDIT) {
    inventory.soonOut += count;
    return;
  }

  inventory.soonIn += count;
};

export const setSafeRemItems = async (
  subdomain: string,
  models: IModels,
  safeRemainder: ISafeRemainderDocument,
  userId: string,
) => {
  const { productCategoryId, branchId, departmentId } = safeRemainder;
  const branchKey = inventoryKey(branchId);
  const departmentKey = inventoryKey(departmentId);
  const existingProductIds: string[] = await models.SafeRemainderItems.distinct(
    'productId',
    { remainderId: safeRemainder._id },
  );
  const productFields = {
    _id: 1,
    uom: 1,
    code: 1,
    [`inventories.${branchKey}.${departmentKey}`]: 1,
  };
  const products: TSafeRemainderProduct[] = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    module: 'products',
    action: 'find',
    input: {
      query: {
        status: { $ne: 'deleted' },
        ...(existingProductIds.length
          ? { _id: { $in: existingProductIds } }
          : {}),
      },
      ...(!existingProductIds.length && productCategoryId
        ? { categoryId: productCategoryId }
        : {}),
      fields: productFields,
      sort: { code: 1 },
    },
    defaultValue: [],
  });

  let bulkOps: any[] = [];
  let order = 0;
  const now = new Date();

  // Get product ids
  const allProductIds = products.map((item) => item._id);
  const lastIncomePrices = await getLastIncomePrices(models, allProductIds);
  const inventoryByProductId: Record<string, TInventoryInfo> = {};
  const invAccountIds = (
    await models.Accounts.find({
      journal: ACCOUNT_JOURNALS.INVENTORY,
    }).lean()
  ).map((acc) => acc._id);

  const trFilter: any = {
    ...locationFilter('branchId', branchId),
    ...locationFilter('departmentId', departmentId),
    'details.accountId': { $in: invAccountIds },
    'details.productId': { $in: allProductIds },
    date: { $lte: safeRemainder.date },
    status: { $in: TR_INVENTORY_STATUS_TYPES.REAL_STATUSES },
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
      ...locationFilter('branchId', branchId),
      ...locationFilter('departmentId', departmentId),
      productId: { $in: allProductIds },
    }).lean();

    for (const lastDet of lastConfigedDetails) {
      const inventory = ensureInventoryInfo(
        inventoryByProductId,
        lastDet.productId,
      );
      inventory.remainder += lastDet.remainder ?? 0;
      inventory.cost += lastDet.cost ?? 0;
      inventory.soonIn += lastDet.soonInCount ?? 0;
      inventory.soonOut += lastDet.soonOutCount ?? 0;
    }
  }

  const trDetails = await models.Transactions.aggregate([
    { $match: trFilter },
    { $unwind: '$details' },
    {
      $match: {
        'details.accountId': { $in: invAccountIds },
        'details.productId': { $in: allProductIds },
      },
    },
    { $sort: { date: 1 } },
    { $project: { details: 1, side: 1, status: 1 } },
  ]);

  for (const trDet of trDetails) {
    applyTransactionDetailToInventory(inventoryByProductId, trDet);
  }

  for (const product of products) {
    order++;
    const productId = product._id;
    const newInfo = inventoryByProductId[productId] ?? {
      remainder: 0,
      cost: 0,
      soonIn: 0,
      soonOut: 0,
    };
    const activeCost = fixNum(Math.max(0, newInfo.cost), 6);
    const activeUnitCost = newInfo.remainder
      ? fixNum(activeCost / newInfo.remainder, 6)
      : 0;
    const nextCount = {
      $cond: [
        {
          $or: [
            { $eq: [{ $ifNull: ['$count', null] }, null] },
            {
              $and: [
                { $eq: ['$status', SAFE_REMAINDER_ITEM_STATUSES.NEW] },
                { $eq: ['$preCount', '$count'] },
              ],
            },
          ],
        },
        newInfo.remainder,
        '$count',
      ],
    };
    const defaultCountedCost = {
      $cond: [
        {
          $and: [
            { $eq: [activeCost, 0] },
            { $gt: [nextCount, newInfo.remainder] },
          ],
        },
        {
          $multiply: [
            { $subtract: [nextCount, newInfo.remainder] },
            lastIncomePrices[productId] ?? 0,
          ],
        },
        { $multiply: [activeUnitCost, nextCount] },
      ],
    };
    const inferredCostExplicit = {
      $ne: [
        { $ifNull: ['$trInfo.unitCost', activeCost] },
        { $ifNull: ['$trInfo.activeCost', activeCost] },
      ],
    };
    const isCostExplicit = {
      $ifNull: ['$trInfo.isCostExplicit', inferredCostExplicit],
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
              createdAt: { $ifNull: ['$createdAt', now] },
              createdBy: { $ifNull: ['$createdBy', userId] },

              preCount: newInfo.remainder,
              cost: newInfo.cost,
              trInfo: {
                $mergeObjects: [
                  { $ifNull: ['$trInfo', {}] },
                  {
                    activeCost,
                    lastIncomePrice: lastIncomePrices[productId] ?? 0,
                    isCostExplicit,
                    unitCost: {
                      $cond: [
                        isCostExplicit,
                        { $ifNull: ['$trInfo.unitCost', defaultCountedCost] },
                        defaultCountedCost,
                      ],
                    },
                  },
                ],
              },
              modifiedAt: now,
              modifiedBy: userId,
              order,

              count: nextCount,
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
    side,
  }: {
    safeRemainder: ISafeRemainderDocument;
    details: ITrDetail[];
    journal: string;
    oldMainTr?: ITransactionDocument;
    otherTrs?: ITransactionDocument[];
    user: IUserDocument;
    followInfos?: ITransaction['followInfos'];
    side?: string;
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
    status: TR_STATUSES.COMPLETE,
    branchId: safeRemainder.branchId,
    departmentId: safeRemainder.departmentId,
    description: 'Census',
    contentType: 'safeRem',
    contentId: safeRemainder._id,
    details,
    followInfos,
    side,
  };
  if (!oldMainTr) {
    // create
    const transactions = await models.Transactions.createPTransaction(
      [transactionDoc, ...(otherTrs ?? [])],
      user._id,
    );
    return transactions?.[0]?.parentId;
  }

  // update
  await models.Transactions.updatePTransaction(
    oldMainTr.parentId,
    [{ ...oldMainTr, ...transactionDoc }, ...(otherTrs ?? [])],
    user._id,
  );
  return oldMainTr.parentId;
};

export const safeRemainderUndoTrs = async (models: IModels, trId?: string) => {
  if (!trId) {
    return;
  }
  const tr = await models.Transactions.findOne({
    $or: [{ _id: trId }, { parentId: trId }],
  }).lean();
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
  const branchKey = inventoryKey(branchId);
  const departmentKey = inventoryKey(departmentId);

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
      fields: { _id: 1, [`inventories.${branchKey}.${departmentKey}`]: 1 },
      sort: { code: 1 },
    },
    defaultValue: [],
  });

  // Get product ids
  const allProductIds = products.map((item: any) => item._id);
  const inventoryByProductId: Record<string, TInventoryInfo> = {};
  const invAccountIds = (
    await models.Accounts.find({
      journal: ACCOUNT_JOURNALS.INVENTORY,
    }).lean()
  ).map((acc) => acc._id);

  const trFilter: any = {
    ...locationFilter('branchId', branchId),
    ...locationFilter('departmentId', departmentId),
    'details.accountId': { $in: invAccountIds },
    'details.productId': { $in: allProductIds },
    status: {
      $in: [
        ...TR_INVENTORY_STATUS_TYPES.REAL_STATUSES,
        ...TR_INVENTORY_STATUS_TYPES.SOON_STATUSES,
      ],
    },
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
      ...locationFilter('branchId', branchId),
      ...locationFilter('departmentId', departmentId),
      productId: { $in: allProductIds },
    }).lean();

    for (const lastDet of lastConfigedDetails) {
      const inventory = ensureInventoryInfo(
        inventoryByProductId,
        lastDet.productId,
      );
      inventory.remainder += lastDet.remainder ?? 0;
      inventory.cost += lastDet.cost ?? 0;
      inventory.soonIn += lastDet.soonInCount ?? 0;
      inventory.soonOut += lastDet.soonOutCount ?? 0;
    }
  }

  const trDetails = await models.Transactions.aggregate([
    { $match: trFilter },
    { $unwind: '$details' },
    {
      $match: {
        'details.accountId': { $in: invAccountIds },
        'details.productId': { $in: allProductIds },
      },
    },
    { $sort: { date: 1 } },
    { $project: { details: 1, side: 1, status: 1 } },
  ]);

  for (const trDet of trDetails) {
    applyTransactionDetailToInventory(inventoryByProductId, trDet);
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
      product.inventories?.[branchKey]?.[departmentKey]?.remainder ?? 0;
    const productCost =
      product.inventories?.[branchKey]?.[departmentKey]?.cost ?? 0;
    const productSoonIn =
      product.inventories?.[branchKey]?.[departmentKey]?.soonIn ?? 0;
    const productSoonOut =
      product.inventories?.[branchKey]?.[departmentKey]?.soonOut ?? 0;
    const newInfo = inventoryByProductId[productId] ?? {
      remainder: 0,
      cost: 0,
      soonIn: 0,
      soonOut: 0,
    };

    if (
      productRemainder === newInfo.remainder &&
      productCost === newInfo.cost &&
      productSoonIn === newInfo.soonIn &&
      productSoonOut === newInfo.soonOut
    ) {
      continue;
    }

    bulkOps.push({
      productId,
      remainder: newInfo.remainder,
      cost: newInfo.cost,
      soonIn: newInfo.soonIn,
      soonOut: newInfo.soonOut,
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
      action: 'findOne',
      input: { query: { _id: productId } },
    });
    products = product?._id ? [product] : [];
  }

  if (productCategoryId) {
    products = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      module: 'products',
      action: 'find',
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
