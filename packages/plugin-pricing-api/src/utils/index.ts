import * as _ from 'lodash';
import * as dayjs from 'dayjs';
import { IModels } from '../connectionResolver';
import {
  checkRepeatRule,
  calculatePriceRule,
  calculateQuantityRule,
  calculateDiscountValue,
  calculateExpiryRule,
  calculatePriceAdjust
} from './rule';
import { getAllowedProducts } from './product';
import { Plan, CalculatedRule, OrderItem } from '../types';

export const checkPricing = async (
  models: IModels,
  subdomain: string,
  prioritizeRule: string,
  totalAmount: number,
  departmentId: string,
  branchId: string,
  orderItems: OrderItem[]
) => {
  const now = dayjs(new Date());
  const nowISO = now.toISOString();
  const productIds: string[] = orderItems.map(p => p.productId);
  const result: object = {};

  let allowedProductIds: string[] = [];

  // Finding valid discounts
  const conditions: any = {
    status: 'active',
    $and: [
      {
        $or: [
          {
            branchIds: { $in: [branchId && branchId] },
            departmentIds: { $size: 0 }
          },
          {
            departmentIds: { $in: [departmentId && departmentId] },
            branchIds: { $size: 0 }
          },
          {
            branchIds: { $size: 0 },
            departmentIds: { $size: 0 }
          },
          {
            departmentIds: { $in: [departmentId && departmentId] },
            branchIds: { $in: [branchId && branchId] }
          }
        ]
      },
      {
        $or: [
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
        ]
      }
    ]
  };

  if (prioritizeRule === 'only') {
    conditions.isPriority = true;
  } else if (prioritizeRule === 'exclude') {
    conditions.isPriority = false;
  }

  const sortArgs: object = {
    isPriority: 1,
    value: 1
  };

  // Prepare object to save calculated data
  for (const productId of productIds) {
    if (!Object.keys(result).includes(productId)) {
      result[productId] = {
        type: '',
        value: 0,
        bonusProducts: []
      };
    }
  }

  const plans: Plan[] = await models.PricingPlans.find(conditions).sort(
    sortArgs
  );

  if (plans.length === 0) {
    return;
  }

  // Calculating discount
  for (const plan of plans) {
    // Take all products that can be discounted
    allowedProductIds = await getAllowedProducts(subdomain, plan, productIds);

    // Check repeat rule first
    const repeatPassed: boolean = checkRepeatRule(plan);
    if (!repeatPassed) {
      continue;
    }

    let appliedBundleCounts: number = Number.POSITIVE_INFINITY;
    let appliedBundleItems: any[] = [];

    // Check rest of the rules
    for (const item of orderItems) {
      if (!allowedProductIds.includes(item.productId)) {
        continue;
      }

      if (appliedBundleCounts > item.quantity)
        appliedBundleCounts = item.quantity;

      let type: string = '';
      let value: number = 0;
      let bonusProducts: any = [];

      let defaultValue: number = calculateDiscountValue(
        plan.type,
        plan.value,
        item.price
      );

      defaultValue = calculatePriceAdjust(
        item.price,
        defaultValue,
        plan.priceAdjustType,
        plan.priceAdjustFactor
      );

      // Check price rules
      const priceRule: CalculatedRule = calculatePriceRule(
        plan,
        item,
        totalAmount,
        defaultValue
      );

      // Check quantity rule
      const quantityRule: CalculatedRule = calculateQuantityRule(
        plan,
        item,
        defaultValue
      );

      // Check expiry rule
      const expiryRule: CalculatedRule = calculateExpiryRule(
        plan,
        item,
        defaultValue
      );

      // Checks if all rules are passed!
      if (priceRule.passed && quantityRule.passed && expiryRule.passed) {
        // Bonus product will always be prioritized
        if (
          (priceRule.type === 'bonus' &&
            priceRule.bonusProducts.length !== 0) ||
          (quantityRule.type === 'bonus' &&
            quantityRule.bonusProducts.length !== 0) ||
          (expiryRule.type === 'bonus' && expiryRule.bonusProducts.length !== 0)
        ) {
          type = 'bonus';
          bonusProducts = [
            ...priceRule.bonusProducts,
            ...quantityRule.bonusProducts,
            ...expiryRule.bonusProducts
          ];
          value = 0;
        }

        // Prioritize highest value between rules
        let rules = [priceRule, quantityRule, expiryRule];
        let maxValueRule = rules.reduce((prev, current) => {
          if (prev.value > current.value && prev.type !== 'bonus') {
            return prev;
          } else if (current.type !== 'bonus') {
            return current;
          }
          return prev;
        });

        if (maxValueRule.type.length !== 0) {
          type = maxValueRule.type;
          value = maxValueRule.value;
        }

        // If none of the rules are applied. Apply default
        if (type.length === 0) {
          type = plan.type;
          value = defaultValue;

          if (bonusProducts.length === 0) {
            bonusProducts = plan.bonusProduct ? [plan.bonusProduct] : [];
          }
        }

        // Finalize values
        if (type !== 'bonus') {
          result[item.productId].type = type;

          // Priority calculation
          if (plan.isPriority) {
            result[item.productId].value += value;
          } else {
            if (result[item.productId].value < value) {
              result[item.productId].value = value;
            }
          }
        }

        if (type === 'bonus') {
          // Priority calculation
          if (plan.isPriority) {
            result[item.productId].bonusProducts = [
              ...result[item.productId].bonusProducts,
              ...bonusProducts
            ];
          } else {
            result[item.productId].bonusProducts = bonusProducts;
          }
        }

        appliedBundleItems.push(item);
      }
    }

    // Calculate bundle
    if (plan.applyType === 'bundle') {
      appliedBundleItems.map((item: any) => {
        if (result[item.productId].type !== 'bonus') {
          result[item.productId].value = Math.floor(
            (result[item.productId].value / item.quantity) * appliedBundleCounts
          );
        }
      });
    }
  }

  return result;
};
