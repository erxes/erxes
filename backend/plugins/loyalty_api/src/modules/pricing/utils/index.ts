import dayjs from 'dayjs';
import { IModels } from '~/connectionResolvers';
import {
  checkRepeatRule,
  calculatePriceRule,
  calculateQuantityRule,
  calculateDiscountValue,
  calculateExpiryRule,
  calculatePriceAdjust
} from './rule';
import { getAllowedProducts } from './product';
import { CalculatedRule, OrderItem } from '../types';

export const getMainConditions = ({
  branchId, departmentId, pipelineId, date
}: {
  branchId?: string, departmentId?: string, pipelineId?: string, date?: Date
}): Record<string, any> => {
  const now = dayjs(date || new Date());
  const nowISO = now.toISOString();

  const andConditions: Record<string, any>[] = [];

  // Build branch/department OR conditions
  const branchDeptOr: Record<string, any>[] = [];

  if (branchId) {
    branchDeptOr.push({
      branchIds: { $in: [branchId] },
      departmentIds: { $size: 0 }
    });
  }

  if (departmentId) {
    branchDeptOr.push({
      departmentIds: { $in: [departmentId] },
      branchIds: { $size: 0 }
    });
  }

  // Always include the case with no branch or department
  branchDeptOr.push({
    branchIds: { $size: 0 },
    departmentIds: { $size: 0 }
  });

  if (branchId && departmentId) {
    branchDeptOr.push({
      departmentIds: { $in: [departmentId] },
      branchIds: { $in: [branchId] }
    });
  }

  if (branchDeptOr.length > 0) {
    andConditions.push({ $or: branchDeptOr });
  }

  // Add pipeline condition if provided
  if (pipelineId) {
    andConditions.push({
      $or: [
        { pipelineId },
        { pipelineId: { $exists: false } },
        { pipelineId: '' }
      ]
    });
  }

  // Add date conditions
  const dateOr = [
    {
      isStartDateEnabled: false,
      isEndDateEnabled: false
    },
    {
      isStartDateEnabled: true,
      isEndDateEnabled: false,
      startDate: {
        $lt: nowISO
      }
    },
    {
      isStartDateEnabled: false,
      isEndDateEnabled: true,
      endDate: {
        $gt: nowISO
      }
    },
    {
      isStartDateEnabled: true,
      isEndDateEnabled: true,
      startDate: {
        $lt: nowISO
      },
      endDate: {
        $gt: nowISO
      }
    }
  ];

  andConditions.push({ status: 'active', $or: dateOr });

  return {
    $and: andConditions
  };
};

// Helper function to calculate default discount value
const calculateDefaultDiscount = (plan: any, item: any): number => {
  let defaultValue = calculateDiscountValue(plan.type, plan.value, item.price);
  defaultValue = calculatePriceAdjust(
    item.price,
    defaultValue,
    plan.priceAdjustType,
    plan.priceAdjustFactor
  );
  return defaultValue;
};

// Helper function to check if any rule has bonus products
// Helper function to check if any rule has bonus products
const hasBonusProducts = (priceRule: CalculatedRule, quantityRule: CalculatedRule, expiryRule: CalculatedRule): boolean => {
  return !!(
    (priceRule.type === 'bonus' && priceRule.bonusProducts?.length) ||
    (quantityRule.type === 'bonus' && quantityRule.bonusProducts?.length) ||
    (expiryRule.type === 'bonus' && expiryRule.bonusProducts?.length)
  );
};
// Helper function to collect bonus products from all rules
const collectBonusProducts = (priceRule: CalculatedRule, quantityRule: CalculatedRule, expiryRule: CalculatedRule): any[] => {
  return [
    ...(priceRule.bonusProducts || []),
    ...(quantityRule.bonusProducts || []),
    ...(expiryRule.bonusProducts || [])
  ];
};

// Helper function to find the max value rule (excluding bonus type)
const findMaxValueRule = (priceRule: CalculatedRule, quantityRule: CalculatedRule, expiryRule: CalculatedRule): CalculatedRule => {
  const rules = [priceRule, quantityRule, expiryRule];
  return rules.reduce((prev, current) => {
    if (prev.value > current.value && prev.type !== 'bonus') {
      return prev;
    } else if (current.type !== 'bonus') {
      return current;
    }
    return prev;
  }, { type: '', value: 0 } as CalculatedRule);
};

// Helper function to process a single item against a plan
const processItemWithPlan = (
  item: OrderItem,
  plan: any,
  totalAmount: number,
  defaultValue: number,
  result: Record<string, { type: string; value: number; bonusProducts: any[] }>
): { type: string; value: number; bonusProducts: any[]; shouldApply: boolean } => {
  const priceRule = calculatePriceRule(plan, item, totalAmount, defaultValue);
  const quantityRule = calculateQuantityRule(plan, item, defaultValue);
  const expiryRule = calculateExpiryRule(plan, item, defaultValue);

  // If any rule fails, don't apply discount
  if (!priceRule.passed || !quantityRule.passed || !expiryRule.passed) {
    return { type: '', value: 0, bonusProducts: [], shouldApply: false };
  }

  let type = '';
  let value = 0;
  let bonusProducts: any[] = [];

  // Check for bonus products first
  if (hasBonusProducts(priceRule, quantityRule, expiryRule)) {
    type = 'bonus';
    bonusProducts = collectBonusProducts(priceRule, quantityRule, expiryRule);
  } else {
    // Find the rule with maximum value
    const maxValueRule = findMaxValueRule(priceRule, quantityRule, expiryRule);
    if (maxValueRule.type?.length) {
      type = maxValueRule.type;
      value = maxValueRule.value;
    }
  }

  // If no rule applied, use default
  if (type.length === 0) {
    type = plan.type;
    value = defaultValue;
    if (plan.bonusProduct) {
      bonusProducts = [plan.bonusProduct];
    }
  }

  return { type, value, bonusProducts, shouldApply: true };
};

// Helper function to update result with calculated values
const updateResultWithCalculations = (
  itemId: string,
  type: string,
  value: number,
  bonusProducts: any[],
  plan: any,
  result: Record<string, { type: string; value: number; bonusProducts: any[] }>
): void => {
  if (type !== 'bonus') {
    result[itemId].type = type;
    if (plan.isPriority) {
      result[itemId].value += value;
    } else if (
      (value > 0 && result[itemId].value < value) ||
      (value < 0 && result[itemId].value > value)
    ) {
      result[itemId].value = value;
    }
  }

  if (type === 'bonus') {
    if (plan.isPriority) {
      result[itemId].bonusProducts = [
        ...result[itemId].bonusProducts,
        ...bonusProducts
      ];
    } else {
      result[itemId].bonusProducts = bonusProducts;
    }
  }
};

// Helper function to apply bundle calculation
const applyBundleCalculation = (
  plan: any,
  appliedBundleItems: any[],
  appliedBundleCounts: number,
  result: Record<string, { type: string; value: number; bonusProducts: any[] }>
): void => {
  if (plan.applyType !== 'bundle') return;

  appliedBundleItems.forEach((item: any) => {
    if (result[item.itemId].type !== 'bonus') {
      result[item.itemId].value = Math.floor(
        (result[item.itemId].value / item.quantity) * appliedBundleCounts
      );
    }
  });
};

// Main function with reduced complexity
export const checkPricing = async (params: {
  models: IModels;
  subdomain: string;
  prioritizeRule: string;
  totalAmount: number;
  departmentId: string;
  branchId: string;
  pipelineId: string;
  orderItems: OrderItem[];
}) => {
  const {
    models,
    subdomain,
    prioritizeRule,
    totalAmount,
    departmentId,
    branchId,
    pipelineId,
    orderItems
  } = params;

  const productIds = orderItems.map(p => p.productId);
  const result: Record<string, { type: string; value: number; bonusProducts: any[] }> = {};

  // Initialize result structure
  orderItems.forEach(item => {
    if (!result[item.itemId]) {
      result[item.itemId] = {
        type: '',
        value: 0,
        bonusProducts: []
      };
    }
  });

  // Prepare query conditions
  const conditions = getMainConditions({ branchId, departmentId, pipelineId });
  if (prioritizeRule === 'only') {
    conditions.isPriority = true;
  } else if (prioritizeRule === 'exclude') {
    conditions.isPriority = false;
  }

  // Fix: Use proper sort order type for MongoDB
  const sortArgs: Record<string, 1 | -1> = {
    isPriority: 1,
    value: 1
  };

  const plans = await models.PricingPlans.find(conditions).sort(sortArgs);

  if (plans.length === 0) {
    return;
  }

  // Process each plan
  for (const plan of plans) {
    const allowedProductIds = await getAllowedProducts(subdomain, plan, productIds || []);

    if (!checkRepeatRule(plan)) {
      continue;
    }

    let appliedBundleCounts = Number.POSITIVE_INFINITY;
    const appliedBundleItems: any[] = [];

    // Process each item
    for (const item of orderItems) {
      if (!allowedProductIds.includes(item.productId)) {
        continue;
      }

      // Update bundle counts
      if (appliedBundleCounts > item.quantity) {
        appliedBundleCounts = item.quantity;
      }

      // Calculate discount
      const defaultValue = calculateDefaultDiscount(plan, item);

      // Process item with plan rules
      const { type, value, bonusProducts, shouldApply } = processItemWithPlan(
        item,
        plan,
        totalAmount,
        defaultValue,
        result
      );

      if (shouldApply) {
        // Update result with calculated values
        updateResultWithCalculations(item.itemId, type, value, bonusProducts, plan, result);
        appliedBundleItems.push(item);
      }
    }

    // Apply bundle calculation if needed
    applyBundleCalculation(plan, appliedBundleItems, appliedBundleCounts, result);
  }

  return result;
};