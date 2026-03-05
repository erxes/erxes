import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { nanoid } from 'nanoid';
import { IModels } from '~/connectionResolvers';
import { ADJ_INV_STATUSES } from '~/modules/accounting/@types/adjustInventory';
import { ACCOUNT_JOURNALS, TR_SIDES } from '~/modules/accounting/@types/constants';
import { ITransaction } from '~/modules/accounting/@types/transaction';
import { IUpdateRemaindersParams } from '~/modules/inventories/@types/safeRemainders';

export const safeRemainderDoTrs = async (models: IModels, safeRemainder, details, journal, oldMainTr, otherTrs, user) => {
  if (!oldMainTr && !details.length) {
    return;
  }

  if (oldMainTr && !details.length) {
    // remove
    await models.Transactions.removePTransaction(oldMainTr.parentId)
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
  }

  if (!oldMainTr && details.length) {
    // create
    console.log(details.length, 'zzzzzzzzzzzzzzzzzzzzzzzzz')
    const mainTrId = nanoid();
    await models.Transactions.createPTransaction([{ ...transactionDoc, _id: mainTrId }], user);
    return mainTrId;
  }

  // update
  await models.Transactions.updatePTransaction(oldMainTr.parentId, [{ ...oldMainTr, ...transactionDoc }, ...otherTrs], user);
  return oldMainTr._id
}

export const safeRemainderUndoTrs = async (models: IModels, trId?: string) => {
  if (!trId) {
    return;
  }
  const tr = await models.Transactions.findOne({ _id: trId }).lean();
  if (!tr) {
    return;
  }

  await models.Transactions.removePTransaction(tr.parentId);
}

export const updateLiveRemainders = async ({
  subdomain,
  models,
  departmentId,
  branchId,
  productCategoryId,
  productIds,
}: IUpdateRemaindersParams & { subdomain: string, models: IModels }) => {
  const productFilter: any = {};
  if (productIds?.length) {
    productFilter._ids = { $in: productIds }
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
      fields: { _id: 1, [`remainders.${branchId}.${departmentId}`]: 1 },
      sort: { code: 1 }
    },
  });

  // Get product ids
  const allProductIds = products.map((item: any) => item._id);
  const remaindersByProductId: { [productId: string]: number } = {};
  const invAccountIds = (await models.Accounts.find({ journal: { $in: ACCOUNT_JOURNALS.INVENTORY } }).lean()).map(acc => acc._id);
  const trFilter: any = {
    branchId,
    departmentId,
    'details.accountId': { $in: invAccountIds },
    'details.productId': { $in: allProductIds },
  };

  const lastAdjInv = await models.AdjustInventories.findOne({ status: ADJ_INV_STATUSES.PUBLISH }).sort({ date: -1 }).lean();
  if (lastAdjInv) {
    trFilter.date = { $gt: lastAdjInv.date };
    const lastConfirmRemainders = await models.AdjustInvDetails.find({ adjustId: lastAdjInv._id, branchId, departmentId, productId: { $in: allProductIds } });
    for (const rem of lastConfirmRemainders) {
      remaindersByProductId[rem.productId] = (remaindersByProductId[rem.productId] ?? 0) + rem.remainder;
    }
  }

  const trDetails = await models.Transactions.aggregate([
    { $match: trFilter },
    { $unwind: '$details' },
    { $match: { 'details.productId': { $in: allProductIds }, } },
    { $sort: { date: 1 } },
    { $project: { details: 1 } }
  ])

  for (const trDet of trDetails) {
    const { details, } = trDet;
    const { productId, count, side } = details;
    const multiplier = side === TR_SIDES.CREDIT ? -1 : 1;

    remaindersByProductId[productId] = (remaindersByProductId[productId] ?? 0) + multiplier * count;
  }

  const resultRemainder: any[] = [];

  let bulkOps: {
    productId: string;
    uom?: string;
    remainder?: number;
    soonIn?: number;
    soonOut?: number;
  }[] = [];

  let counter = 0
  for (const product of products) {
    const productId = product._id;
    const productRemainder = product.remainders?.[branchId]?.[departmentId]?.remainder ?? 0;
    const newRemainder = remaindersByProductId[productId];

    if (productRemainder === newRemainder) {
      continue;
    }

    counter += 1;
    bulkOps.push({
      productId,
      remainder: newRemainder
    });
    resultRemainder.push({
      branchId,
      departmentId,
      productId,
      count: newRemainder
    })

    if (counter > 100) {
      await sendTRPCMessage({
        subdomain,
        method: 'mutation',
        pluginName: 'core',
        module: 'products',
        action: 'setRemainders',
        input: {
          branchId,
          departmentId,
          productsInfo: bulkOps
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
        productsInfo: bulkOps
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
