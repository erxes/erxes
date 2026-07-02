import { sendTRPCMessage } from 'erxes-api-shared/utils';
import dayjs from 'dayjs';
import { IModels } from '~/connectionResolvers';
import { IPricingPlanDocument } from '@/pricing/@types/pricingPlan';
import { getChildCategories, getChildTags } from '~/utils/utils';
import { PRIORITY_TYPES } from '../db/definitions/constants';
import { calculateDiscountValue, calculatePriceAdjust } from './rule';

const DEFAULT_KEY = '_';

type CoreProduct = {
  _id: string;
  unitPrice?: number;
};

type PublicDiscountValue = {
  discount: number;
  discountPercent: number;
  planId: string;
};

type ProductDiscounts = Record<string, Record<string, PublicDiscountValue>>;

type ProductDiscountInfo = {
  productId: string;
  discounts: ProductDiscounts;
};

const toKey = (id?: string) => id || DEFAULT_KEY;

const getContextPairs = (plan: IPricingPlanDocument) => {
  const branchIds = plan.branchIds?.length ? plan.branchIds : [DEFAULT_KEY];
  const departmentIds = plan.departmentIds?.length
    ? plan.departmentIds
    : [DEFAULT_KEY];
  const pairs: Array<{ branchId: string; departmentId: string }> = [];

  for (const branchId of branchIds) {
    for (const departmentId of departmentIds) {
      pairs.push({
        branchId: toKey(branchId),
        departmentId: toKey(departmentId),
      });
    }
  }

  return pairs;
};

const getProducts = async (
  subdomain: string,
  query: Record<string, unknown>,
): Promise<CoreProduct[]> => {
  return (await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    module: 'products',
    action: 'find',
    input: {
      query,
      fields: { _id: 1, unitPrice: 1 },
    },
    defaultValue: [],
  })) as CoreProduct[];
};

const getPlanProducts = async (
  subdomain: string,
  plan: IPricingPlanDocument,
): Promise<CoreProduct[]> => {
  const excludedProductIds = plan.productsExcluded || [];
  const excludedFilter = excludedProductIds.length
    ? { _id: { $nin: excludedProductIds } }
    : {};

  switch (plan.applyType) {
    case 'product':
      return getProducts(subdomain, {
        _id: {
          $in: plan.products || [],
          ...(excludedProductIds.length ? { $nin: excludedProductIds } : {}),
        },
      });

    case 'bundle':
      return getProducts(subdomain, {
        _id: {
          $in: (plan.productsBundle || []).flat(),
          ...(excludedProductIds.length ? { $nin: excludedProductIds } : {}),
        },
      });

    case 'segment': {
      let productIds: string[] = [];

      for (const segmentId of plan.segments || []) {
        const ids = (await sendTRPCMessage({
          subdomain,
          pluginName: 'core',
          module: 'segment',
          action: 'fetchSegment',
          input: { segmentId },
          defaultValue: [],
        })) as string[];

        productIds = productIds.concat(ids);
      }

      return getProducts(subdomain, {
        _id: {
          $in: productIds,
          ...(excludedProductIds.length ? { $nin: excludedProductIds } : {}),
        },
      });
    }

    case 'vendor':
      return getProducts(subdomain, {
        vendorId: { $in: plan.vendors || [] },
        ...excludedFilter,
      });

    case 'category': {
      const includeCatIds = await getChildCategories(
        subdomain,
        plan.categories || [],
      );
      const excludeCatIds = await getChildCategories(
        subdomain,
        plan.categoriesExcluded || [],
      );
      const categoryIds = includeCatIds.filter(
        (categoryId) => !excludeCatIds.includes(categoryId),
      );

      return getProducts(subdomain, {
        categoryId: { $in: categoryIds },
        ...excludedFilter,
      });
    }

    case 'tag': {
      const includeTagIds = await getChildTags(subdomain, plan.tags || []);
      const excludeTagIds = await getChildTags(
        subdomain,
        plan.tagsExcluded || [],
      );
      const tagIds = includeTagIds.filter(
        (tagId) => !excludeTagIds.includes(tagId),
      );

      return getProducts(subdomain, {
        tagIds: { $in: tagIds },
        ...excludedFilter,
      });
    }

    default:
      return [];
  }
};

const calculatePublicDiscount = (
  plan: IPricingPlanDocument,
  product: CoreProduct,
): PublicDiscountValue | null => {
  const unitPrice = product.unitPrice || 0;

  if (unitPrice <= 0) {
    return null;
  }

  const rawDiscount = calculateDiscountValue(plan.type, plan.value, unitPrice);
  const discount = calculatePriceAdjust(
    unitPrice,
    rawDiscount,
    plan.priceAdjustType,
    plan.priceAdjustFactor,
  );

  if (discount <= 0) {
    return null;
  }

  return {
    discount,
    discountPercent: (discount / unitPrice) * 100,
    planId: plan._id,
  };
};

const setWinnerDiscount = (
  discounts: ProductDiscounts,
  branchId: string,
  departmentId: string,
  nextDiscount: PublicDiscountValue,
) => {
  const currentDiscount = discounts[branchId]?.[departmentId];

  if (currentDiscount && currentDiscount.discount >= nextDiscount.discount) {
    return;
  }

  discounts[branchId] = {
    ...(discounts[branchId] || {}),
    [departmentId]: nextDiscount,
  };
};

export const recalculatePublicPricingPlanDiscounts = async ({
  models,
  subdomain,
}: {
  models: IModels;
  subdomain: string;
}): Promise<ProductDiscountInfo[]> => {
  const nowISO = dayjs().toISOString();
  const plans = await models.PricingPlans.find({
    status: 'active',
    priority: PRIORITY_TYPES.PUBLIC,
    $or: [
      {
        isStartDateEnabled: false,
        isEndDateEnabled: false,
      },
      {
        isStartDateEnabled: true,
        isEndDateEnabled: false,
        startDate: { $lt: nowISO },
      },
      {
        isStartDateEnabled: false,
        isEndDateEnabled: true,
        endDate: { $gt: nowISO },
      },
      {
        isStartDateEnabled: true,
        isEndDateEnabled: true,
        startDate: { $lt: nowISO },
        endDate: { $gt: nowISO },
      },
    ],
  }).sort({ value: 1 });

  const productDiscountsById = new Map<string, ProductDiscounts>();

  for (const plan of plans) {
    const products = await getPlanProducts(subdomain, plan);
    const contextPairs = getContextPairs(plan);

    for (const product of products) {
      const publicDiscount = calculatePublicDiscount(plan, product);

      if (!publicDiscount) {
        continue;
      }

      const discounts = productDiscountsById.get(product._id) || {};

      for (const { branchId, departmentId } of contextPairs) {
        setWinnerDiscount(discounts, branchId, departmentId, publicDiscount);
      }

      productDiscountsById.set(product._id, discounts);
    }
  }

  const productsInfo = Array.from(productDiscountsById.entries()).map(
    ([productId, discounts]) => ({
      productId,
      discounts,
    }),
  );

  await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'mutation',
    module: 'products',
    action: 'replaceDiscounts',
    input: {
      productsInfo,
    },
    defaultValue: null,
  });

  return productsInfo;
};
