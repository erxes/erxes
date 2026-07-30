import {
  PricingRuleSheet,
  type PricingRuleSheetCallbacks,
} from '@/pricing/edit-pricing/components/rules/PricingRuleSheet';
import type { PricingRuleConfig } from '@/pricing/edit-pricing/components/rules/pricingRuleUtils';

export type PriceRuleConfig = PricingRuleConfig;

const PRICE_RULE_TYPES = [
  { value: 'exact', label: 'exact' },
  { value: 'every', label: 'every' },
  { value: 'minimum', label: 'minimum' },
];

export const PriceRuleSheet = (props: PricingRuleSheetCallbacks) => (
  <PricingRuleSheet
    {...props}
    addTitle="add-price-rule"
    editTitle="edit-price-rule"
    defaultRuleType="exact"
    ruleTypeOptions={PRICE_RULE_TYPES}
    ruleValueHint="0.00$"
  />
);
