import * as dayjs from 'dayjs';
import { CalculatedRule } from '../types';

/**
 * Calculation of discount amount by type
 * @param type discount type
 * @param value discount value
 * @param price initial price
 * @returns discounted value
 */
export const calculateDiscountValue = (
  type: any,
  value: number,
  price: number
): number => {
  switch (type) {
    case 'fixed':
      return price - value;
    case 'subtraction':
      return value;
    case 'percentage':
      return Math.floor(price * (value / 100));
    default:
      return 0;
  }
};

/**
 * Check if rule is passes or not
 * @param rule
 * @param checkValue
 * @returns boolean
 */
export const checkRuleValidity = (rule: any, checkValue: number): boolean => {
  switch (rule.type) {
    case 'exact':
      if (checkValue === rule.value) return true;
      return false;
    case 'minimum':
    case 'every':
      if (checkValue >= rule.value) return true;
      return false;
    default:
      return false;
  }
};

/**
 * Check repeat rules
 * @param plan
 * @returns
 */
export const checkRepeatRule = (plan: any): boolean => {
  // Check repeat rules
  const now = dayjs(new Date());
  let repeatPassed: boolean = false;
  let rulePassCount: number = 0;

  // If repeat rule is disabled, rule passes
  if (!plan.isRepeatEnabled) repeatPassed = true;
  if (
    plan.isRepeatEnabled &&
    plan.repeatRules &&
    plan.repeatRules.length !== 0
  ) {
    for (const rule of plan.repeatRules) {
      switch (rule.type) {
        case 'everyDay':
          if (
            rule.dayStartValue &&
            now.hour() >= dayjs(rule.dayStartValue).hour() &&
            now.minute() >= dayjs(rule.dayStartValue).minute() &&
            rule.dayEndValue &&
            now.hour() <= dayjs(rule.dayEndValue).hour() &&
            now.minute() <= dayjs(rule.dayEndValue).minute()
          )
            rulePassCount++;
          break;
        case 'everyWeek':
          if (
            rule.weekValue &&
            rule.weekValue.find(i => i.value === now.day().toString())
          )
            rulePassCount++;
          break;
        case 'everyMonth':
          if (
            rule.monthValue &&
            rule.monthValue.find(i => i.value === now.date().toString())
          )
            rulePassCount++;
          break;
        case 'everyYear':
          if (
            rule.yearStartValue &&
            now.isAfter(dayjs(rule.yearStartValue)) &&
            rule.yearEndValue &&
            now.isBefore(dayjs(rule.yearEndValue))
          )
            rulePassCount++;
          break;
        default:
          break;
      }
    }

    if (rulePassCount === plan.repeatRules.length) repeatPassed = true;
  }

  return repeatPassed;
};

export const calculatePriceRule = (
  plan: any,
  item: any,
  totalAmount: number,
  defaultValue: number
): CalculatedRule => {
  let passed: boolean = false;
  let type: string = '';
  let value: number = 0;
  let bonusProducts: string[] = [];

  if (!plan.isPriceEnabled) passed = true;
  if (plan.isPriceEnabled && plan.priceRules && plan.priceRules.length !== 0)
    for (const rule of plan.priceRules) {
      // Check validity
      let rulePassed = false;
      rulePassed = checkRuleValidity(rule, totalAmount);
      if (rulePassed) passed = true;
      if (!rulePassed) continue;

      if (rule.discountType === 'bonus' && rule.discountBonusProduct) {
        type = rule.discountType;
        bonusProducts.push(rule.discountBonusProduct);
        continue;
      }

      // Checks fixed, sub, and percentage
      let calculatedValue: number =
        rule.discountType === 'default'
          ? defaultValue
          : calculateDiscountValue(
              rule.discountType,
              rule.discountValue,
              item.price
            );

      // Checks if value is lower than past calculated price, override it
      if (calculatedValue > value) {
        type = rule.discountType;
        value = calculatedValue;
      }
    }

  return {
    passed,
    type,
    value,
    bonusProducts
  };
};

export const calculateQuantityRule = (
  plan: any,
  item: any,
  defaultValue: number
): CalculatedRule => {
  let passed: boolean = false;
  let type: string = '';
  let value: number = 0;
  let bonusProducts: string[] = [];

  // Check quantity rules
  if (!plan.isQuantityEnabled) passed = true;
  if (
    plan.isQuantityEnabled &&
    plan.quantityRules &&
    plan.quantityRules.length !== 0
  )
    for (const rule of plan.quantityRules) {
      // Check validity
      let rulePassed = false;
      rulePassed = checkRuleValidity(rule, item.quantity);
      if (rulePassed) passed = true;
      if (!rulePassed) continue;

      if (rule.discountType === 'bonus') {
        type = rule.discountType;
        bonusProducts.push(rule.discountBonusProduct);

        if (rule.type === 'every') {
          let discountQuantity = Math.floor(item.quantity / rule.value);

          if (bonusProducts.length !== 0) {
            for (let i = 0; i < discountQuantity - 1; i++)
              bonusProducts.push(rule.discountBonusProduct);
          }
        }
        continue;
      }

      let calculatedValue: number =
        rule.discountType === 'default'
          ? defaultValue
          : calculateDiscountValue(
              rule.discountType,
              rule.discountValue,
              item.price
            );

      // Calculate remainder product's price
      if (rule.type === 'every') {
        let discountQuantity =
          Math.floor(item.quantity / rule.value) * rule.value;

        if (discountQuantity >= rule.value) {
          calculatedValue = Math.floor(
            (calculatedValue * discountQuantity) / item.quantity
          );
        }
      }

      // Checks if value is lower than past calculated price, override it
      if (calculatedValue > value) {
        type = rule.discountType;
        value = calculatedValue;
      }
    }

  return {
    passed,
    type,
    value,
    bonusProducts
  };
};

export const calculateExpiryRule = (
  plan: any,
  item: any,
  defaultValue: number
): CalculatedRule => {
  const now = dayjs(new Date());
  let passed: boolean = false;
  let type: string = '';
  let value: number = 0;
  let bonusProducts: string[] = [];

  // Check expiry rule
  if (!plan.isExpiryEnabled) passed = true;
  if (plan.isExpiryEnabled && plan.expiryRules && plan.expiryRules.length !== 0)
    for (const rule of plan.expiryRules) {
      // Check validity
      const expiredDate = dayjs
        .unix(parseInt(item.manufacturedDate) * 1000)
        .add(rule.value, rule.type);
      let rulePassed = false;

      if (now.isAfter(expiredDate)) rulePassed = true;
      if (rulePassed) passed = true;
      if (!rulePassed) continue;

      if (rule.discountType === 'bonus') {
        type = rule.discountType;
        bonusProducts.push(rule.discountBonusProduct);
        continue;
      }

      let calculatedValue: number =
        rule.discountType === 'default'
          ? defaultValue
          : calculateDiscountValue(
              rule.discountType,
              rule.discountValue,
              item.price
            );

      // Checks if value is lower than past calculated price, override it
      if (calculatedValue > value) {
        type = rule.discountType;
        value = calculatedValue;
      }
    }

  return {
    passed,
    type,
    value,
    bonusProducts
  };
};
