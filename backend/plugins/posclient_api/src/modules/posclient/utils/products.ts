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

const DISCOUNT_DEFAULT_KEY = '_';
type DiscountField = 'discount' | 'discountPercent';
type DiscountRangeOperator = '$gte' | '$lte';
type ProductFilter = Record<string, unknown>;
type DiscountConditions = Record<string, unknown>;

export const getDiscountScope = (
  config: IConfigDocument,
  paramBranchId?: string,
) => {
  const branchId =
    paramBranchId &&
    (config.branchId === paramBranchId ||
      (config.allowBranchIds || []).includes(paramBranchId))
      ? paramBranchId
      : config.branchId;

  return {
    branchId: branchId || DISCOUNT_DEFAULT_KEY,
    departmentId: config.departmentId || DISCOUNT_DEFAULT_KEY,
  };
};

const compactDiscountConditions = (conditions: DiscountConditions = {}) =>
  Object.entries(conditions).reduce<DiscountConditions>(
    (result, [key, value]) => {
      if (value === undefined || value === null || value === '') {
        return result;
      }

      result[key] = value;
      return result;
    },
    {},
  );

export const getDiscountConditions = (
  config: IConfigDocument,
  paramBranchId?: string,
  conditions: DiscountConditions = {},
) => {
  const { branchId, departmentId } = getDiscountScope(config, paramBranchId);

  return compactDiscountConditions({
    ...conditions,
    branchId: conditions.branchId || branchId,
    departmentId: conditions.departmentId || departmentId,
  });
};

const isRangeCondition = (
  value: unknown,
): value is { start?: string | number; end?: string | number } =>
  !!value && typeof value === 'object' && !Array.isArray(value);

const conditionMatches = (expected: unknown, actual: unknown) => {
  if (actual === undefined || actual === null) {
    return false;
  }

  if (Array.isArray(expected)) {
    return expected.includes(actual as never);
  }

  if (isRangeCondition(expected)) {
    const { start, end } = expected;
    const actualValue = actual as string | number;

    if (start !== undefined && actualValue < start) {
      return false;
    }

    if (end !== undefined && actualValue > end) {
      return false;
    }

    return true;
  }

  if (typeof expected === 'number' && typeof actual === 'number') {
    return actual >= expected;
  }

  return expected === actual;
};

export const getDiscount = (
  discounts: IProductDocument['discounts'],
  config: IConfigDocument,
  paramBranchId?: string,
  discountConditions?: DiscountConditions,
) => {
  const conditions = getDiscountConditions(
    config,
    paramBranchId,
    discountConditions,
  );

  return (discounts || [])
    .filter((discount) =>
      (discount.prefixes || []).every((prefix) =>
        conditionMatches(discount.conditions?.[prefix], conditions[prefix]),
      ),
    )
    .sort((a, b) => b.discount - a.discount)[0];
};

const getConditionValueExpression = (conditionsExpression, prefixExpression) => ({
  $first: {
    $map: {
      input: {
        $filter: {
          input: { $objectToArray: conditionsExpression },
          as: 'condition',
          cond: { $eq: ['$$condition.k', prefixExpression] },
        },
      },
      as: 'condition',
      in: '$$condition.v',
    },
  },
});

const getRuleConditionMatchExpression = (requestConditions: DiscountConditions) => {
  const requestConditionsExpression = { $literal: requestConditions };

  return {
    $allElementsTrue: {
      $map: {
        input: { $ifNull: ['$$discount.prefixes', []] },
        as: 'prefix',
        in: {
          $let: {
            vars: {
              requestValue: getConditionValueExpression(
                requestConditionsExpression,
                '$$prefix',
              ),
              ruleValue: getConditionValueExpression(
                { $ifNull: ['$$discount.conditions', {}] },
                '$$prefix',
              ),
            },
            in: {
              $and: [
                { $ne: ['$$requestValue', null] },
                {
                  $cond: [
                    { $isArray: '$$ruleValue' },
                    { $in: ['$$requestValue', '$$ruleValue'] },
                    {
                      $cond: [
                        { $eq: [{ $type: '$$ruleValue' }, 'object'] },
                        {
                          $and: [
                            {
                              $or: [
                                { $eq: ['$$ruleValue.start', null] },
                                { $gte: ['$$requestValue', '$$ruleValue.start'] },
                              ],
                            },
                            {
                              $or: [
                                { $eq: ['$$ruleValue.end', null] },
                                { $lte: ['$$requestValue', '$$ruleValue.end'] },
                              ],
                            },
                          ],
                        },
                        {
                          $cond: [
                            {
                              $in: [
                                { $type: '$$ruleValue' },
                                ['int', 'long', 'double', 'decimal'],
                              ],
                            },
                            { $gte: ['$$requestValue', '$$ruleValue'] },
                            { $eq: ['$$ruleValue', '$$requestValue'] },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          },
        },
      },
    },
  };
};

const getMatchingDiscountsExpression = (conditions: DiscountConditions) => ({
  $filter: {
    input: { $ifNull: ['$discounts', []] },
    as: 'discount',
    cond: getRuleConditionMatchExpression(conditions),
  },
});

export const getDiscountValueExpression = (
  field: DiscountField,
  conditions: DiscountConditions,
) => ({
  $ifNull: [
    {
      $max: {
        $map: {
          input: getMatchingDiscountsExpression(conditions),
          as: 'discount',
          in: `$$discount.${field}`,
        },
      },
    },
    0,
  ],
});

export const isDiscountSortField = (sortField?: string) =>
  sortField === 'discount' || sortField === 'discountPercent';

const hasDiscountRangeValue = (value?: number | null): value is number =>
  value !== undefined && value !== null;

const buildDiscountRangeFilter = (
  field: DiscountField,
  operator: DiscountRangeOperator,
  value: number,
  conditions: DiscountConditions,
) => ({
  $expr: {
    [operator]: [getDiscountValueExpression(field, conditions), value],
  },
});

export const pushDiscountRangeFilters = (
  filters: ProductFilter[],
  config: IConfigDocument,
  branchId: string | undefined,
  params: {
    minDiscountValue?: number | null;
    maxDiscountValue?: number | null;
    minDiscountPercent?: number | null;
    maxDiscountPercent?: number | null;
    discountConditions?: DiscountConditions;
  },
) => {
  const conditions = getDiscountConditions(
    config,
    branchId,
    params.discountConditions,
  );

  const addRangeFilter = (
    field: DiscountField,
    operator: DiscountRangeOperator,
    value?: number | null,
  ) => {
    if (!hasDiscountRangeValue(value)) {
      return;
    }

    filters.push(
      buildDiscountRangeFilter(field, operator, value, conditions),
    );
  };

  addRangeFilter('discount', '$gte', params.minDiscountValue);
  addRangeFilter('discount', '$lte', params.maxDiscountValue);
  addRangeFilter('discountPercent', '$gte', params.minDiscountPercent);
  addRangeFilter('discountPercent', '$lte', params.maxDiscountPercent);
};

export const getDiscountSortedProducts = async ({
  models,
  filter,
  config,
  params,
}: {
  models: IModels;
  filter: ProductFilter;
  config: IConfigDocument;
  params: {
    branchId?: string;
    sortField?: string;
    sortDirection?: number;
    page?: number;
    perPage?: number;
    discountConditions?: DiscountConditions;
  };
}) => {
  const discountField =
    params.sortField === 'discountPercent' ? 'discountPercent' : 'discount';
  const sortDirection = params.sortDirection === -1 ? -1 : 1;
  const page = Math.max(1, Number(params.page) || 1);
  const perPage = Math.max(1, Number(params.perPage) || 20);
  const conditions = getDiscountConditions(
    config,
    params.branchId,
    params.discountConditions,
  );

  return models.Products.aggregate([
    { $match: filter },
    {
      $addFields: {
        discountSortValue: getDiscountValueExpression(discountField, conditions),
      },
    },
    { $sort: { discountSortValue: sortDirection, code: 1, _id: 1 } },
    { $skip: (page - 1) * perPage },
    { $limit: perPage },
  ]);
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

export const syncDiscounts = async (
  subdomain: string,
  models: IModels,
  products: IProductDocument[],
) => {
  const batchSize = 100;

  for (let i = 0; i < products.length; i += batchSize) {
    const checkProducts = products.slice(i, i + batchSize);
    const productIds = checkProducts.map((product) => product._id);

    const coreProducts = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      module: 'products',
      action: 'find',
      input: {
        query: { _id: { $in: productIds } },
        fields: { discounts: 1 },
        limit: productIds.length,
      },
      defaultValue: [],
    });

    const coreProductsById = {};
    for (const coreProduct of coreProducts) {
      coreProductsById[coreProduct._id] = coreProduct;
    }

    const bulkOps = checkProducts.map((product) => ({
      updateOne: {
        filter: { _id: product._id },
        update: {
          $set: {
            discounts: coreProductsById[product._id]?.discounts || [],
          },
        },
      },
    }));

    if (bulkOps.length) {
      await models.Products.bulkWrite(bulkOps);
    }
  }
};
