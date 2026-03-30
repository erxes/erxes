import { IUserDocument } from 'erxes-api-shared/core-types';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { nanoid } from 'nanoid';
import { IModels } from '~/connectionResolvers';
import { ADJ_INV_STATUSES } from '~/modules/accounting/@types/adjustInventory';
import {
  ACCOUNT_JOURNALS,
  TR_SIDES,
} from '~/modules/accounting/@types/constants';
import { ITransaction, ITransactionDocument, ITrDetail } from '~/modules/accounting/@types/transaction';
import { ISafeRemainderDocument, IUpdateRemaindersParams } from '~/modules/inventories/@types/safeRemainders';

export const safeRemainderDoTrs = async (
  models: IModels,
  {
    safeRemainder,
    details,
    journal,
    oldMainTr,
    otherTrs,
    user,
    followInfos
  }: {
    safeRemainder: ISafeRemainderDocument,
    details: ITrDetail[],
    journal: string,
    oldMainTr?: ITransactionDocument,
    otherTrs?: ITransactionDocument[],
    user: IUserDocument,
    followInfos?: any
  }
) => {
  if (!oldMainTr && !details.length) {
    return;
  }

  if (oldMainTr && !details.length) {
    // remove
    await models.Transactions.removePTransaction({ parentId: oldMainTr.parentId });
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
    followInfos
  };

  if (!oldMainTr) {
    // create
    const mainTrId = nanoid();
    await models.Transactions.createPTransaction(
      [{ ...transactionDoc, _id: mainTrId }],
      user,
    );
    return mainTrId;
  }

  // update
  await models.Transactions.updatePTransaction(
    oldMainTr.parentId,
    [{ ...oldMainTr, ...transactionDoc }, ...(otherTrs ?? [])],
    user,
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
  const productFilter: any = {};
  if (productIds?.length) {
    productFilter._ids = { $in: productIds };
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

  const resultRemainder: any[] = [];

  let bulkOps: {
    productId: string;
    uom?: string;
    remainder?: number;
    cost?: number;
    soonIn?: number;
    soonOut?: number;
  }[] = [];

  let counter = 0;
  for (const product of products) {
    const productId = product._id;
    const productRemainder =
      product.inventories?.[branchId]?.[departmentId]?.remainder ?? 0;
    const productCost =
      product.inventories?.[branchId]?.[departmentId]?.cost ?? 0;
    const newInfo = inventoryByProductId[productId];

    if (
      productRemainder === newInfo.remainder &&
      productCost === newInfo.cost
    ) {
      continue;
    }

    counter += 1;
    bulkOps.push({
      productId,
      remainder: newInfo.remainder,
      cost: newInfo.cost,
    });
    resultRemainder.push({
      branchId,
      departmentId,
      productId,
      count: newInfo.remainder,
      cost: newInfo.cost,
    });

    if (counter > 100) {
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
      counter = 0;
      bulkOps = [];
    }
  }

  if (bulkOps.length) {
    await sendTRPCMessage({
      subdomain,
      method: 'mutation',
      pluginName: 'core',
      module: 'products',
      action: 'setRemainders',
      input: {
        branchId,
        departmentId,
        productsInfo: bulkOps,
      },
    });
  }

  return resultRemainder;
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
