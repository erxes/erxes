import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { IPricingPlanDocument } from '@/pricing/@types/pricingPlan';
import { IPriceRule } from '@/pricing/@types/priceRule';
import { IQuantityRule } from '@/pricing/@types/quantityRule';
import { IExpiryRule } from '@/pricing/@types/expiryRule';
import { getChildCategories, getChildTags } from '~/utils/utils';
import { PRIORITY_TYPES } from '../db/definitions/constants';
import {
  calculateDiscountValue,
  calculatePriceAdjust,
  checkRuleValidity,
} from './rule';

type DiscountConditionValue =
  | string
  | number
  | boolean
  | string[]
  | number[]
  | {
      start?: string | number;
      end?: string | number;
    };

type DiscountConditions = Record<string, DiscountConditionValue>;

type CoreProduct = {
  _id: string;
  unitPrice?: number;
};

type ProductDiscount = {
  planId: string;
  discount: number;
  discountPercent: number;
  prefixes: string[];
  conditions: DiscountConditions;
};

type ProductDiscountInfo = {
  productId: string;
  discounts: ProductDiscount[];
};

type RuleDiscountOption = {
  conditions: DiscountConditions;
  discount: number;
};

const addCondition = (
  conditions: DiscountConditions,
  prefix: string,
  value?: DiscountConditionValue | null,
) => {
  if (
    value === undefined ||
    value === null ||
    value === '' ||
    (Array.isArray(value) && !value.length)
  ) {
    return;
  }

  conditions[prefix] = value;
};

const mergeConditions = (...conditionList: DiscountConditions[]) =>
  conditionList.reduce<DiscountConditions>(
    (result, conditions) => ({ ...result, ...conditions }),
    {},
  );

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

const calculateAdjustedDiscount = (
  product: CoreProduct,
  discountType: string,
  discountValue: number,
  priceAdjustType: string,
  priceAdjustFactor: number,
) => {
  const unitPrice = product.unitPrice || 0;

  if (unitPrice <= 0) {
    return 0;
  }

  const rawDiscount = calculateDiscountValue(discountType, discountValue, unitPrice);

  return calculatePriceAdjust(
    unitPrice,
    rawDiscount,
    priceAdjustType,
    priceAdjustFactor,
  );
};

const calculatePlanDiscount = (
  plan: IPricingPlanDocument,
  product: CoreProduct,
) =>
  calculateAdjustedDiscount(
    product,
    plan.type,
    plan.value,
    plan.priceAdjustType,
    plan.priceAdjustFactor,
  );

const calculateRuleDiscount = (
  rule: IPriceRule | IQuantityRule | IExpiryRule,
  product: CoreProduct,
  defaultDiscount: number,
) => {
  if (rule.discountType === 'bonus') {
    return 0;
  }

  if (rule.discountType === 'default') {
    return defaultDiscount;
  }

  return calculateAdjustedDiscount(
    product,
    rule.discountType,
    rule.discountValue,
    rule.priceAdjustType,
    rule.priceAdjustFactor,
  );
};

const getPlanConditions = (plan: IPricingPlanDocument): DiscountConditions => {
  const conditions: DiscountConditions = {};

  addCondition(conditions, 'branchId', plan.branchIds || []);
  addCondition(conditions, 'departmentId', plan.departmentIds || []);
  addCondition(conditions, 'boardId', plan.boardId);
  addCondition(conditions, 'pipelineId', plan.pipelineId);
  addCondition(conditions, 'stageId', plan.stageId);
  addCondition(conditions, 'customerId', plan.customerIds || []);
  addCondition(conditions, 'customerTagId', plan.customerTags || []);
  addCondition(conditions, 'customerSegmentId', plan.customerSegmentIds || []);
  addCondition(conditions, 'companyId', plan.companyIds || []);
  addCondition(conditions, 'companyTagId', plan.companyTags || []);
  addCondition(conditions, 'companySegmentId', plan.companySegmentIds || []);
  addCondition(conditions, 'userId', plan.userIds || []);
  addCondition(conditions, 'userPosition', plan.userPositions || []);
  addCondition(conditions, 'userSegmentId', plan.userSegmentIds || []);
  addCondition(conditions, 'brokerCustomerId', plan.brokerCustomerIds || []);
  addCondition(conditions, 'brokerCustomerTagId', plan.brokerCustomerTags || []);
  addCondition(
    conditions,
    'brokerCustomerSegmentId',
    plan.brokerCustomerSegmentIds || [],
  );
  addCondition(conditions, 'brokerCompanyId', plan.brokerCompanyIds || []);
  addCondition(conditions, 'brokerCompanyTagId', plan.brokerCompanyTags || []);
  addCondition(
    conditions,
    'brokerCompanySegmentId',
    plan.brokerCompanySegmentIds || [],
  );
  addCondition(conditions, 'brokerUserId', plan.brokerUserIds || []);
  addCondition(conditions, 'brokerUserPosition', plan.brokerUserPositions || []);
  addCondition(conditions, 'brokerUserSegmentId', plan.brokerUserSegmentIds || []);

  if (plan.isStartDateEnabled || plan.isEndDateEnabled) {
    addCondition(conditions, 'date', {
      start: plan.isStartDateEnabled ? plan.startDate?.toISOString() : undefined,
      end: plan.isEndDateEnabled ? plan.endDate?.toISOString() : undefined,
    });
  }

  for (const rule of plan.repeatRules || []) {
    if (rule.type === 'everyDay') {
      addCondition(conditions, 'hour', {
        start: rule.dayStartValue?.getHours(),
        end: rule.dayEndValue?.getHours(),
      });
    }

    if (rule.type === 'everyWeek') {
      addCondition(
        conditions,
        'weekDay',
        (rule.weekValue || []).map((value) => Number(value.value)),
      );
    }

    if (rule.type === 'everyMonth') {
      addCondition(
        conditions,
        'monthDay',
        (rule.monthValue || []).map((value) => Number(value.value)),
      );
    }

    if (rule.type === 'everyYear') {
      addCondition(conditions, 'yearDate', {
        start: rule.yearStartValue?.toISOString(),
        end: rule.yearEndValue?.toISOString(),
      });
    }
  }

  return conditions;
};

const priceRuleConditions = (rule: IPriceRule): DiscountConditions => ({
  price: { start: rule.value },
});

const quantityRuleConditions = (rule: IQuantityRule): DiscountConditions => ({
  quantity: { start: rule.value },
});

const expiryRuleConditions = (rule: IExpiryRule): DiscountConditions => ({
  [`expiry.${rule.type}`]: { start: rule.value },
});

const getRuleOptions = <TRule extends IPriceRule | IQuantityRule | IExpiryRule>({
  enabled,
  rules,
  product,
  defaultDiscount,
  getConditions,
}: {
  enabled?: boolean;
  rules?: TRule[];
  product: CoreProduct;
  defaultDiscount: number;
  getConditions: (rule: TRule) => DiscountConditions;
}): RuleDiscountOption[] => {
  if (!enabled) {
    return [{ conditions: {}, discount: defaultDiscount }];
  }

  return (rules || [])
    .map((rule) => ({
      conditions: getConditions(rule),
      discount: calculateRuleDiscount(rule, product, defaultDiscount),
    }))
    .filter((option) => option.discount > 0);
};

const combineRuleOptions = (
  optionGroups: RuleDiscountOption[][],
): RuleDiscountOption[] => {
  return optionGroups.reduce<RuleDiscountOption[]>(
    (combinations, options) =>
      combinations.flatMap((combination) =>
        options.map((option) => ({
          conditions: mergeConditions(combination.conditions, option.conditions),
          discount: Math.max(combination.discount, option.discount),
        })),
      ),
    [{ conditions: {}, discount: 0 }],
  );
};

const buildProductDiscounts = (
  plan: IPricingPlanDocument,
  product: CoreProduct,
): ProductDiscount[] => {
  const unitPrice = product.unitPrice || 0;
  const defaultDiscount = calculatePlanDiscount(plan, product);

  if (unitPrice <= 0 || defaultDiscount <= 0) {
    return [];
  }

  const planConditions = getPlanConditions(plan);
  const ruleCombinations = combineRuleOptions([
    getRuleOptions({
      enabled: plan.isPriceEnabled,
      rules: plan.priceRules,
      product,
      defaultDiscount,
      getConditions: priceRuleConditions,
    }),
    getRuleOptions({
      enabled: plan.isQuantityEnabled,
      rules: plan.quantityRules,
      product,
      defaultDiscount,
      getConditions: quantityRuleConditions,
    }),
    getRuleOptions({
      enabled: plan.isExpiryEnabled,
      rules: plan.expiryRules,
      product,
      defaultDiscount,
      getConditions: expiryRuleConditions,
    }),
  ]);

  return ruleCombinations
    .map((combination) => {
      const conditions = mergeConditions(planConditions, combination.conditions);
      const discount = combination.discount || defaultDiscount;

      return {
        planId: plan._id,
        discount,
        discountPercent: (discount / unitPrice) * 100,
        prefixes: Object.keys(conditions),
        conditions,
      };
    })
    .filter((discount) => discount.discount > 0);
};

export const recalculatePublicPricingPlanDiscounts = async ({
  models,
  subdomain,
}: {
  models: IModels;
  subdomain: string;
}): Promise<ProductDiscountInfo[]> => {
  const plans = await models.PricingPlans.find({
    status: 'active',
    priority: PRIORITY_TYPES.PUBLIC,
  }).sort({ value: 1 });

  const productDiscountsById = new Map<string, ProductDiscount[]>();

  for (const plan of plans) {
    const products = await getPlanProducts(subdomain, plan);

    for (const product of products) {
      const discounts = buildProductDiscounts(plan, product);

      if (!discounts.length) {
        continue;
      }

      productDiscountsById.set(product._id, [
        ...(productDiscountsById.get(product._id) || []),
        ...discounts,
      ]);
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
