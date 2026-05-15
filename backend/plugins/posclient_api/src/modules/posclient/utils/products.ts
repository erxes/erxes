import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { IConfigDocument } from '~/modules/posclient/@types/configs';
import { IProductDocument } from '~/modules/posclient/@types/products';

export const getRemBranchId = (
  config: IConfigDocument,
  paramBranchId?: string,
) => {
  if (!paramBranchId) {
    return 'default';
  }

  if (config.branchId === paramBranchId) {
    return 'default';
  }

  if (!(config.allowBranchIds || []).includes(paramBranchId)) {
    return 'default';
  }

  return paramBranchId;
};

const getRemainderScope = (
  config: IConfigDocument,
  paramBranchId?: string,
) => {
  const branchIds = paramBranchId
    ? [paramBranchId]
    : config.isOnline
      ? config.allowBranchIds || []
      : (config.branchId && [config.branchId]) || [];

  return {
    branchIds,
    departmentIds: config.departmentId ? [config.departmentId] : [],
  };
};

const calcRemainderFromInventories = (
  inventories: any = {},
  branchIds: string[] = [],
  departmentIds: string[] = [],
) => {
  const result = {
    remainder: 0,
    soonIn: 0,
    soonOut: 0,
    remainders: [] as any[],
  };

  for (const branchId of Object.keys(inventories || {})) {
    if (branchIds.length && !branchIds.includes(branchId)) {
      continue;
    }

    for (const departmentId of Object.keys(inventories[branchId] || {})) {
      if (departmentIds.length && !departmentIds.includes(departmentId)) {
        continue;
      }

      const info = inventories[branchId][departmentId] || {};
      const count = Number(info.remainder) || 0;
      const soonIn = Number(info.soonIn) || 0;
      const soonOut = Number(info.soonOut) || 0;

      result.remainder += count;
      result.soonIn += soonIn;
      result.soonOut += soonOut;
      result.remainders.push({
        branchId,
        departmentId,
        count,
        soonIn,
        soonOut,
      });
    }
  }

  return result;
};

export const checkRemainders = async (
  subdomain: string,
  models: IModels,
  config: IConfigDocument,
  checkProducts: IProductDocument[],
  paramBranchId?: string,
) => {
  const products: any = checkProducts;

  if (!config.isCheckRemainder && !config.saveRemainder) {
    return products;
  }

  if (!products.length) {
    return products;
  }

  const { branchIds, departmentIds } = getRemainderScope(
    config,
    paramBranchId,
  );
  const productIds = products.map((p) => p._id);

  const coreProducts = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    module: 'products',
    action: 'find',
    input: {
      query: { _id: { $in: productIds } },
      fields: { inventories: 1 },
      limit: productIds.length,
    },
    defaultValue: [],
  });

  const coreProductsById = {};
  for (const coreProduct of coreProducts) {
    coreProductsById[coreProduct._id] = coreProduct;
  }

  const bulkOps: Array<{
    updateOne: {
      filter: { _id: string };
      update: { $set: any };
    };
  }> | undefined = config.saveRemainder ? [] : undefined;
  const remBranchId = config.saveRemainder
    ? getRemBranchId(config, paramBranchId)
    : '';

  for (const product of products) {
    const remainderInfo = calcRemainderFromInventories(
      coreProductsById[product._id]?.inventories,
      branchIds,
      departmentIds,
    );

    product.remainders = remainderInfo.remainders;
    product.remainder = remainderInfo.remainder;
    product.soonIn = remainderInfo.soonIn;
    product.soonOut = remainderInfo.soonOut;

    if (!config.saveRemainder) {
      continue;
    }

    if (!product.remainderByToken) {
      product.remainderByToken = {};
    }
    if (!product.remainderByToken[config.token]) {
      product.remainderByToken[config.token] = {};
    }

    product.remainderByToken[config.token][remBranchId] =
      product.remainder ?? 0;
    bulkOps?.push({
      updateOne: {
        filter: { _id: product._id },
        update: {
          $set: {
            [`remainderByToken.${config.token}.${remBranchId}`]: product.remainder ?? 0,
          },
        },
      },
    });
  }

  if (bulkOps?.length) {
    await models.Products.bulkWrite(bulkOps);
  }

  return products;
};

export const syncRemainders = async (
  subdomain: string,
  models: IModels,
  config: IConfigDocument,
  products: IProductDocument[],
) => {
  const batchSize = 100;

  for (let i = 0; i < products.length; i += batchSize) {
    const checkProducts = products.slice(i, i + batchSize);
    for (const paramBranchId of config.allowBranchIds || []) {
      await checkRemainders(
        subdomain,
        models,
        config,
        checkProducts,
        paramBranchId,
      );
    }
    await checkRemainders(subdomain, models, config, checkProducts);
  }
};
