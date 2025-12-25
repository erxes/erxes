import { shortStrToDate } from 'erxes-api-shared/utils';
import dayjs from 'dayjs';
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
 * Adjust price
 * @param price Price to calculate
 * @param type Math type to adjust
 * @param factor Factor
 * @returns Calculated Number
 */
export const calculatePriceAdjust = (
  price: number,
  discountValue: number,
  type: string,
  factor: number
): number => {
  const factorPow = Math.pow(10, factor);
  let priceToAdjust = price - discountValue;

  switch (type) {
    case 'round':
      return price - Math.round(priceToAdjust / factorPow) * factorPow;
    case 'floor':
      return price - Math.floor(priceToAdjust / factorPow) * factorPow;
    case 'ceil':
      return price - Math.ceil(priceToAdjust / factorPow) * factorPow;
    case 'endsWith9':
      return price - Math.floor(priceToAdjust / factorPow) * factorPow + 1;
    default:
      return price - priceToAdjust;
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
      return checkValue === rule.value;
    case 'minimum':
    case 'every':
      return checkValue >= rule.value;
    default:
      return false;
  }
};

// Helper functions for checkRepeatRule
const checkEveryDayRule = (rule: any, now: dayjs.Dayjs): boolean => {
  if (!rule.dayStartValue || !rule.dayEndValue) return false;
  
  const startHour = dayjs(rule.dayStartValue).hour();
  const startMinute = dayjs(rule.dayStartValue).minute();
  const endHour = dayjs(rule.dayEndValue).hour();
  const endMinute = dayjs(rule.dayEndValue).minute();
  
  const currentHour = now.hour();
  const currentMinute = now.minute();
  
  if (currentHour < startHour || (currentHour === startHour && currentMinute < startMinute)) {
    return false;
  }
  
  if (currentHour > endHour || (currentHour === endHour && currentMinute > endMinute)) {
    return false;
  }
  
  return true;
};

const checkEveryWeekRule = (rule: any, now: dayjs.Dayjs): boolean => {
  return rule.weekValue?.some((item: any) => item.value === now.day().toString()) ?? false;
};

const checkEveryMonthRule = (rule: any, now: dayjs.Dayjs): boolean => {
  return rule.monthValue?.some((item: any) => item.value === now.date().toString()) ?? false;
};

const checkEveryYearRule = (rule: any, now: dayjs.Dayjs): boolean => {
  if (!rule.yearStartValue || !rule.yearEndValue) return false;
  return now.isAfter(dayjs(rule.yearStartValue)) && now.isBefore(dayjs(rule.yearEndValue));
};

/**
 * Check repeat rules
 * @param plan
 * @returns
 */
export const checkRepeatRule = (plan: any): boolean => {
  // If repeat rule is disabled, rule passes
  if (!plan.isRepeatEnabled) {
    return true;
  }
  
  // If no repeat rules, rule fails
  if (!plan.repeatRules?.length) {
    return false;
  }

  const now = dayjs(new Date());
  let rulePassCount = 0;

  for (const rule of plan.repeatRules) {
    let rulePassed = false;
    
    switch (rule.type) {
      case 'everyDay':
        rulePassed = checkEveryDayRule(rule, now);
        break;
      case 'everyWeek':
        rulePassed = checkEveryWeekRule(rule, now);
        break;
      case 'everyMonth':
        rulePassed = checkEveryMonthRule(rule, now);
        break;
      case 'everyYear':
        rulePassed = checkEveryYearRule(rule, now);
        break;
      default:
        rulePassed = false;
    }
    
    if (rulePassed) {
      rulePassCount++;
    }
  }

  return rulePassCount === plan.repeatRules.length;
};

// Helper functions for price rule calculation
const calculateRuleValue = (
  rule: any,
  defaultValue: number,
  item: any
): number => {
  const calculatedValue = rule.discountType === 'default'
    ? defaultValue
    : calculateDiscountValue(rule.discountType, rule.discountValue, item.price);
  
  return calculatePriceAdjust(
    item.price,
    calculatedValue,
    rule.priceAdjustType,
    rule.priceAdjustFactor
  );
};

const processPriceRule = (
  rule: any,
  item: any,
  totalAmount: number,
  defaultValue: number,
  currentType: string,
  currentValue: number,
  bonusProducts: string[]
): { type: string; value: number; bonusProducts: string[] } => {
  let type = currentType;
  let value = currentValue;
  const updatedBonusProducts = [...bonusProducts];
  
  if (!checkRuleValidity(rule, totalAmount)) {
    return { type, value, bonusProducts: updatedBonusProducts };
  }

  if (rule.discountType === 'bonus' && rule.discountBonusProduct) {
    type = rule.discountType;
    updatedBonusProducts.push(rule.discountBonusProduct);
    return { type, value, bonusProducts: updatedBonusProducts };
  }

  const calculatedValue = calculateRuleValue(rule, defaultValue, item);
  
  if (calculatedValue > value) {
    type = rule.discountType;
    value = calculatedValue;
  }

  return { type, value, bonusProducts: updatedBonusProducts };
};

export const calculatePriceRule = (
  plan: any,
  item: any,
  totalAmount: number,
  defaultValue: number
): CalculatedRule => {
  const result: CalculatedRule = {
    passed: !plan.isPriceEnabled,
    type: '',
    value: 0,
    bonusProducts: []
  };

  if (!plan.isPriceEnabled || !plan.priceRules?.length) {
    return result;
  }

  let hasPassedRule = false;
  let type = '';
  let value = 0;
  let bonusProducts: string[] = [];

  for (const rule of plan.priceRules) {
    const ruleResult = processPriceRule(rule, item, totalAmount, defaultValue, type, value, bonusProducts);
    
    type = ruleResult.type;
    value = ruleResult.value;
    bonusProducts = ruleResult.bonusProducts;
    
    if (checkRuleValidity(rule, totalAmount)) {
      hasPassedRule = true;
    }
  }

  return {
    passed: result.passed || hasPassedRule,
    type,
    value,
    bonusProducts
  };
};

// Helper functions for quantity rule calculation
const addBonusProductsForEveryRule = (
  discountBonusProduct: string,
  itemQuantity: number,
  ruleValue: number,
  bonusProducts: string[]
): string[] => {
  const discountQuantity = Math.floor(itemQuantity / ruleValue);
  const updatedBonusProducts = [...bonusProducts];
  
  for (let i = 0; i < discountQuantity; i++) {
    updatedBonusProducts.push(discountBonusProduct);
  }
  
  return updatedBonusProducts;
};

const calculateEveryRuleValue = (
  rule: any,
  item: any,
  baseValue: number
): number => {
  const discountQuantity = Math.floor(item.quantity / rule.value) * rule.value;
  
  if (discountQuantity < rule.value) {
    return baseValue;
  }
  
  return Math.floor((baseValue * discountQuantity) / item.quantity);
};

const processQuantityRule = (
  rule: any,
  item: any,
  defaultValue: number,
  currentType: string,
  currentValue: number,
  bonusProducts: string[]
): { type: string; value: number; bonusProducts: string[]; passed: boolean } => {
  let type = currentType;
  let value = currentValue;
  const updatedBonusProducts = [...bonusProducts];
  let passed = false;
  
  if (!checkRuleValidity(rule, item.quantity)) {
    return { type, value, bonusProducts: updatedBonusProducts, passed: false };
  }
  
  passed = true;

  if (rule.discountType === 'bonus' && rule.discountBonusProduct) {
    type = rule.discountType;
    let newBonusProducts = [...updatedBonusProducts, rule.discountBonusProduct];
    
    if (rule.type === 'every') {
      newBonusProducts = addBonusProductsForEveryRule(
        rule.discountBonusProduct,
        item.quantity,
        rule.value,
        newBonusProducts
      );
    }
    
    return { type, value, bonusProducts: newBonusProducts, passed };
  }

  let calculatedValue = rule.discountType === 'default'
    ? defaultValue
    : calculateDiscountValue(rule.discountType, rule.discountValue, item.price);
  
  if (rule.type === 'every') {
    calculatedValue = calculateEveryRuleValue(rule, item, calculatedValue);
  }
  
  calculatedValue = calculatePriceAdjust(
    item.price,
    calculatedValue,
    rule.priceAdjustType,
    rule.priceAdjustFactor
  );
  
  if (calculatedValue > value) {
    type = rule.discountType;
    value = calculatedValue;
  }

  return { type, value, bonusProducts: updatedBonusProducts, passed };
};

export const calculateQuantityRule = (
  plan: any,
  item: any,
  defaultValue: number
): CalculatedRule => {
  const result: CalculatedRule = {
    passed: !plan.isQuantityEnabled,
    type: '',
    value: 0,
    bonusProducts: []
  };

  if (!plan.isQuantityEnabled || !plan.quantityRules?.length) {
    return result;
  }

  let hasPassedRule = false;
  let type = '';
  let value = 0;
  let bonusProducts: string[] = [];

  for (const rule of plan.quantityRules) {
    const ruleResult = processQuantityRule(rule, item, defaultValue, type, value, bonusProducts);
    
    type = ruleResult.type;
    value = ruleResult.value;
    bonusProducts = ruleResult.bonusProducts;
    
    if (ruleResult.passed) {
      hasPassedRule = true;
    }
  }

  return {
    passed: result.passed || hasPassedRule,
    type,
    value,
    bonusProducts
  };
};

// Helper functions for expiry rule calculation
const isProductExpired = (
  manufacturedDate: string,
  rule: any,
  now: dayjs.Dayjs
): boolean => {
  const expiredDate = dayjs(
    Number(shortStrToDate(manufacturedDate, 92, 'h', 'n'))
  ).add(rule.value, rule.type);
  
  return now.isAfter(expiredDate);
};

const processExpiryRule = (
  rule: any,
  item: any,
  defaultValue: number,
  now: dayjs.Dayjs,
  currentType: string,
  currentValue: number,
  bonusProducts: string[]
): { type: string; value: number; bonusProducts: string[]; passed: boolean } => {
  let type = currentType;
  let value = currentValue;
  const updatedBonusProducts = [...bonusProducts];
  let passed = false;
  
  if (!item.manufacturedDate) {
    return { type, value, bonusProducts: updatedBonusProducts, passed: false };
  }
  
  const isExpired = isProductExpired(item.manufacturedDate, rule, now);
  
  if (!isExpired) {
    return { type, value, bonusProducts: updatedBonusProducts, passed: false };
  }
  
  passed = true;

  if (rule.discountType === 'bonus' && rule.discountBonusProduct) {
    type = rule.discountType;
    updatedBonusProducts.push(rule.discountBonusProduct);
    return { type, value, bonusProducts: updatedBonusProducts, passed };
  }

  const calculatedValue = rule.discountType === 'default'
    ? defaultValue
    : calculateDiscountValue(rule.discountType, rule.discountValue, item.price);
  
  const adjustedValue = calculatePriceAdjust(
    item.price,
    calculatedValue,
    rule.priceAdjustType,
    rule.priceAdjustFactor
  );
  
  if (adjustedValue > value) {
    type = rule.discountType;
    value = adjustedValue;
  }

  return { type, value, bonusProducts: updatedBonusProducts, passed };
};

export const calculateExpiryRule = (
  plan: any,
  item: any,
  defaultValue: number
): CalculatedRule => {
  const now = dayjs(new Date());
  const result: CalculatedRule = {
    passed: !plan.isExpiryEnabled,
    type: '',
    value: 0,
    bonusProducts: []
  };

  if (!plan.isExpiryEnabled || !plan.expiryRules?.length) {
    return result;
  }

  let hasPassedRule = false;
  let type = '';
  let value = 0;
  let bonusProducts: string[] = [];

  for (const rule of plan.expiryRules) {
    const ruleResult = processExpiryRule(rule, item, defaultValue, now, type, value, bonusProducts);
    
    type = ruleResult.type;
    value = ruleResult.value;
    bonusProducts = ruleResult.bonusProducts;
    
    if (ruleResult.passed) {
      hasPassedRule = true;
    }
  }

  return {
    passed: result.passed || hasPassedRule,
    type,
    value,
    bonusProducts
  };
};