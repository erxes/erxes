import * as _ from 'lodash';
import * as dayjs from 'dayjs';
import { IModels } from '../connectionResolver';
import {
  checkRepeatRule,
  calculatePriceRule,
  calculateQuantityRule,
  calculateDiscountValue,
  calculateExpiryRule
} from './rule';
import { getAllowedProducts } from './product';

export const checkPricing = async (
  models: IModels,
  subdomain: string,
  totalAmount: number,
  departmentId: string,
  branchId: string,
  orderItems: any
) => {
  const now = dayjs(new Date());
  const nowISO = now.toISOString();
  const productIds = orderItems.map(p => p.productId);
  const result: any = {};

  let allowedProductIds: any = [];

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

  const sortArgs: any = {
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

  const plans: any = await models.PricingPlans.find(conditions).sort(sortArgs);

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

      const defaultValue: number = calculateDiscountValue(
        plan.type,
        plan.value,
        item.price
      );

      // Check price rules
      const priceRule: any = calculatePriceRule(plan, item, totalAmount);

      // Check quantity rule
      const quantityRule: any = calculateQuantityRule(plan, item);

      // Check expiry rule
      const expiryRule: any = calculateExpiryRule(plan, item);

      // Checks if all rules are passed!
      if (priceRule.passed && quantityRule.passed && expiryRule.passed) {
        // Bonus product will always be prioritized
        if (priceRule.type === 'bonus' && priceRule.bonusProduct) {
          bonusProducts = [priceRule.bonusProduct];
        }
        if (quantityRule.type === 'bonus' && quantityRule.bonusProduct) {
          bonusProducts = [quantityRule.bonusProduct];
        }
        if (expiryRule.type === 'bonus' && expiryRule.bonusProduct) {
          bonusProducts = [expiryRule.bonusProduct];
        }

        // Prioritize highest value between rules
        if (
          priceRule.value > quantityRule.value &&
          priceRule.value > expiryRule.value &&
          priceRule.type !== 'bonus'
        ) {
          type = priceRule.type;
          value = priceRule.value;
        } else if (
          quantityRule.value > priceRule.value &&
          quantityRule.value > expiryRule.value &&
          quantityRule.type !== 'bonus'
        ) {
          type = quantityRule.type;
          value = quantityRule.value;
        } else if (expiryRule.type !== 'bonus') {
          type = expiryRule.type;
          value = expiryRule.value;
        }

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
        }

        // Priority calculation
        if (plan.isPriority) {
          result[item.productId].value += value;
        } else {
          if (result[item.productId].value < value) {
            result[item.productId].value = value;
          }
        }

        result[item.productId].bonusProducts = result[
          item.productId
        ].bonusProducts.concat(bonusProducts || []);

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
