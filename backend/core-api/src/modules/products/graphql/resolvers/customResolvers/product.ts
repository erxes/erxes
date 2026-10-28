import { IInventory, IProductDocument } from 'erxes-api-shared/core-types';
import {
  sendTRPCMessage,
  withoutPermissionScope,
} from 'erxes-api-shared/utils';
import { pathIdsOf } from '@/organization/structure/utils';
import { PRODUCT_SIMILARITY_STATUSES } from '@/products/constants';
import { IContext } from '~/connectionResolvers';
import { IProductParams } from '~/modules/products/@types';

type DiscountConditions = Record<string, unknown>;
export type RequestDiscountConditions = DiscountConditions & {
  placeEntityId?: string[];
};
type ProductDiscount = {
  planId: string;
  discount: number;
  discountPercent: number;
  prefixes: string[];
  conditions: DiscountConditions;
  base?: boolean | null;
};

type PipelineInventoryScope = {
  placeEntityIds?: string[];
  initialCategoryIds?: string[];
  excludeCategoryIds?: string[];
  excludeProductIds?: string[];
};

const memoizeByRequest = <T>() => {
  const cacheByRequest = new WeakMap<IContext, Map<string, Promise<T>>>();

  return (context: IContext, key: string, load: () => Promise<T>) => {
    let requestCache = cacheByRequest.get(context);

    if (!requestCache) {
      requestCache = new Map();
      cacheByRequest.set(context, requestCache);
    }

    let value = requestCache.get(key);

    if (!value) {
      value = load();
      requestCache.set(key, value);
    }

    return value;
  };
};

const pipelineInventoryScopeByRequest =
  memoizeByRequest<PipelineInventoryScope>();

const placePathIdsByRequest = memoizeByRequest<string[]>();

export const getPipelineInventoryScope = (
  context: IContext,
  pipelineId: string,
) => {
  const { subdomain } = context;

  return pipelineInventoryScopeByRequest(
    context,
    `${subdomain}:${pipelineId}`,
    () =>
      sendTRPCMessage({
        subdomain,
        pluginName: 'sales',
        module: 'pipeline',
        action: 'findOne',
        input: {
          query: { _id: pipelineId },
          fields: {
            placeEntityIds: 1,
            initialCategoryIds: 1,
            excludeCategoryIds: 1,
            excludeProductIds: 1,
          },
        },
        defaultValue: {},
      }),
  );
};

export const getPlacePathIds = (context: IContext, placeEntityId?: string) =>
  placePathIdsByRequest(context, placeEntityId || '', async () => {
    const place = placeEntityId
      ? await withoutPermissionScope(() =>
          context.models.StructureEntities.findOne(
            { _id: placeEntityId },
            { order: 1 },
          ).lean(),
        )
      : null;

    if (place) {
      return pathIdsOf(place.order);
    }

    const root = await withoutPermissionScope(() =>
      context.models.StructureEntities.getRoot(),
    );

    return placeEntityId ? [root._id, placeEntityId] : [root._id];
  });

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

export const getDiscountConditions = async (
  context: IContext,
  params: Partial<IProductParams> = {},
): Promise<RequestDiscountConditions> => ({
  ...compactDiscountConditions({
    ...params.discountConditions,
    pipelineId: params.pipelineId,
  }),
  placeEntityId: await getPlacePathIds(context, params.placeEntityId),
});

const isRangeCondition = (
  value: unknown,
): value is { start?: string | number; end?: string | number } =>
  !!value && typeof value === 'object' && !Array.isArray(value);

const conditionMatches = (expected: unknown, actual: unknown): boolean => {
  if (Array.isArray(actual)) {
    return actual.some((value) => conditionMatches(expected, value));
  }

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

const getPlaceDepth = (
  discount: ProductDiscount,
  { placeEntityId: placePathIds = [] }: RequestDiscountConditions,
) =>
  placePathIds.reduce(
    (depth, placeId, index) =>
      conditionMatches(discount.conditions?.placeEntityId, placeId)
        ? index
        : depth,
    0,
  );

const byClosestPlace =
  (conditions: RequestDiscountConditions) =>
  (a: ProductDiscount, b: ProductDiscount) =>
    getPlaceDepth(b, conditions) - getPlaceDepth(a, conditions) ||
    b.discount - a.discount;

export const getMatchingDiscount = (
  discounts: unknown,
  conditions: RequestDiscountConditions,
  base = false,
) => {
  return ((Array.isArray(discounts) ? discounts : []) as ProductDiscount[])
    .filter(
      (discount) =>
        (discount.base === true) === base &&
        (discount.prefixes || []).every((prefix) =>
          conditionMatches(discount.conditions?.[prefix], conditions[prefix]),
        ),
    )
    .sort(byClosestPlace(conditions))[0];
};

const BASE_SCOPE_FIELDS = ['placeEntityId', 'pipelineId'] as const;

export const getMatchingBaseDiscount = (
  discounts: unknown,
  conditions: RequestDiscountConditions,
) => {
  return ((Array.isArray(discounts) ? discounts : []) as ProductDiscount[])
    .filter((discount) => {
      if (discount.base !== true) {
        return false;
      }

      const comparableFields = BASE_SCOPE_FIELDS.filter(
        (field) =>
          discount.conditions?.[field] !== undefined &&
          conditions[field] !== undefined,
      );

      return (
        comparableFields.length > 0 &&
        comparableFields.every((field) =>
          conditionMatches(discount.conditions?.[field], conditions[field]),
        )
      );
    })
    .sort(byClosestPlace(conditions))[0];
};

export default {
  __resolveReference: async (
    { _id }: { _id: string },
    { models }: IContext,
  ) => {
    return models.Products.findOne({ _id });
  },
  category: async (
    product: IProductDocument,
    _args: undefined,
    { models }: IContext,
  ) => {
    if (!product.categoryId) {
      return null;
    }

    return models.ProductCategories.findOne({ _id: product.categoryId });
  },
  vendor: async (
    product: IProductDocument,
    _args: undefined,
    { models }: IContext,
  ) => {
    if (!product.vendorId) {
      return null;
    }

    return models.Companies.findOne({ _id: product.vendorId });
  },

  remainder: async (
    product: { inventories?: IInventory },
    _args: undefined,
    context: IContext,
    info: any,
  ) => {
    const { placeEntityId, pipelineId } = info?.variableValues || {};
    let { placeEntityIds } = info?.variableValues || {};

    if (placeEntityId) {
      const { remainder, cost, soonIn, soonOut } =
        product?.inventories?.[placeEntityId] || {};
      return { remainder, cost, soonIn, soonOut };
    }

    if (pipelineId && !placeEntityIds?.length) {
      const pipeline = await getPipelineInventoryScope(context, pipelineId);

      placeEntityIds = pipeline?.placeEntityIds?.length
        ? pipeline.placeEntityIds
        : ['_'];
    }

    const result = { remainder: 0, cost: 0, soonIn: 0, soonOut: 0 };

    for (const placeId of Object.keys(product.inventories || {})) {
      if (placeEntityIds?.length && !placeEntityIds.includes(placeId)) {
        continue;
      }

      const {
        remainder = 0,
        cost = 0,
        soonIn = 0,
        soonOut = 0,
      } = product.inventories?.[placeId] || {};
      result.remainder += remainder;
      result.cost += cost;
      result.soonIn += soonIn;
      result.soonOut += soonOut;
    }
    return result;
  },

  discount: async (
    product: IProductDocument,
    args: IProductParams,
    context: IContext,
    info: any,
  ) => {
    return getMatchingDiscount(
      product.discounts,
      await getDiscountConditions(context, {
        ...info?.variableValues,
        ...args,
      }),
    );
  },

  similarity: async (
    product: IProductDocument,
    _args: undefined,
    { models }: IContext,
  ) => {
    if (!product.similarityId) {
      return null;
    }

    return models.ProductSimilarities.findOne({
      _id: product.similarityId,
      status: { $ne: PRODUCT_SIMILARITY_STATUSES.DELETED },
    }).lean();
  },

  uom: async (
    product: IProductDocument,
    _args: undefined,
    { models }: IContext,
  ) => {
    if (!product.uom) {
      return null;
    }

    const uom = await models.Uoms.findOne({
      $or: [{ _id: product.uom }, { name: product.uom }, { code: product.uom }],
    }).lean();

    if (!uom) {
      return null;
    }

    return uom?.name || uom?.code || '';
  },

  // Codes without a condition (removed) are left out until it is recreated.
  conditions: async (
    product: IProductDocument,
    _args: undefined,
    { models }: IContext,
  ) => {
    if (!product.conditionCodes?.length) {
      return [];
    }

    return models.ProductConditions.find({
      code: { $in: product.conditionCodes },
    }).lean();
  },
};
