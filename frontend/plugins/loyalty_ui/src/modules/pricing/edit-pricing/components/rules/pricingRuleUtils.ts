import {
  DiscountType,
  PriceAdjustType,
  RULE_DISCOUNT_TYPES,
  PRICE_ADJUST_TYPES,
} from '@/pricing/edit-pricing/components';
import {
  IPricingExpiryRule,
  IPricingPlanDetail,
  IPricingPriceRule,
  IPricingQuantityRule,
} from '@/pricing/types';

export type PricingRuleType = 'quantity' | 'price' | 'expiry';

export interface PricingRuleConfig {
  _id?: string;
  ruleType: string;
  ruleValue: string;
  discountType: DiscountType;
  discountValue: string;
  priceAdjustType: PriceAdjustType;
  priceAdjustFactor: string;
  bonusProductId?: string | null;
}

export type PricingRulePayload =
  | IPricingQuantityRule
  | IPricingPriceRule
  | IPricingExpiryRule;

const parseRuleNumber = (value: string) => {
  if (value.trim() === '') {
    return undefined;
  }

  const numberValue = Number(value);

  return Number.isFinite(numberValue) ? numberValue : undefined;
};

const getDiscountType = (value?: string): DiscountType =>
  RULE_DISCOUNT_TYPES.find((option) => option.value === value)?.value ||
  'default';

const getPriceAdjustType = (value?: string): PriceAdjustType => {
  if (value === 'default') {
    return 'none';
  }

  return (
    PRICE_ADJUST_TYPES.find((option) => option.value === value)?.value || 'none'
  );
};

export const mapRuleToConfig = (
  rule: PricingRulePayload,
  index: number,
): PricingRuleConfig => ({
  _id: `rule_${index}`,
  ruleType: rule.type ?? 'exact',
  ruleValue: rule.value === undefined ? '' : String(rule.value),
  discountType: getDiscountType(rule.discountType),
  discountValue:
    rule.discountValue === undefined ? '' : String(rule.discountValue),
  priceAdjustType: getPriceAdjustType(rule.priceAdjustType),
  priceAdjustFactor:
    rule.priceAdjustFactor === undefined ? '' : String(rule.priceAdjustFactor),
  bonusProductId: rule.discountBonusProduct || null,
});

export const mapConfigToRule = (
  rule: PricingRuleConfig,
): PricingRulePayload => ({
  type: rule.ruleType,
  value: parseRuleNumber(rule.ruleValue) ?? 0,
  discountType: rule.discountType,
  discountValue: parseRuleNumber(rule.discountValue) ?? 0,
  discountBonusProduct: rule.bonusProductId || '',
  priceAdjustType: rule.priceAdjustType,
  priceAdjustFactor: parseRuleNumber(rule.priceAdjustFactor) ?? 0,
});

export const isRuleNumber = (value: string) =>
  value.trim() !== '' && parseRuleNumber(value) !== undefined;

export const isOptionalInteger = (value: string) => {
  if (value.trim() === '') {
    return true;
  }

  const numberValue = parseRuleNumber(value);

  return numberValue !== undefined && Number.isInteger(numberValue);
};

export const getPricingRules = (
  pricingDetail: IPricingPlanDetail,
  ruleType: PricingRuleType,
): PricingRulePayload[] => {
  switch (ruleType) {
    case 'quantity':
      return pricingDetail.quantityRules || [];
    case 'price':
      return pricingDetail.priceRules || [];
    case 'expiry':
      return pricingDetail.expiryRules || [];
  }
};

export const getPricingRuleEnabled = (
  pricingDetail: IPricingPlanDetail,
  ruleType: PricingRuleType,
) => {
  switch (ruleType) {
    case 'quantity':
      return pricingDetail.isQuantityEnabled ?? false;
    case 'price':
      return pricingDetail.isPriceEnabled ?? false;
    case 'expiry':
      return pricingDetail.isExpiryEnabled ?? false;
  }
};

export const getPricingRuleDocument = (
  pricingId: string,
  ruleType: PricingRuleType,
  enabled: boolean,
  rules: PricingRuleConfig[],
): Partial<IPricingPlanDetail> & { _id: string } => {
  const mappedRules = rules.map(mapConfigToRule);

  switch (ruleType) {
    case 'quantity':
      return {
        _id: pricingId,
        isQuantityEnabled: enabled,
        quantityRules: mappedRules,
      };
    case 'price':
      return {
        _id: pricingId,
        isPriceEnabled: enabled,
        priceRules: mappedRules,
      };
    case 'expiry':
      return {
        _id: pricingId,
        isExpiryEnabled: enabled,
        expiryRules: mappedRules,
      };
  }
};
