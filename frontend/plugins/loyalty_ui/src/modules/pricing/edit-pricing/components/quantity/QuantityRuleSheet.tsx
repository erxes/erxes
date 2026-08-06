import {
  PricingRuleSheet,
  type PricingRuleSheetCallbacks,
} from '@/pricing/edit-pricing/components/rules/PricingRuleSheet';
import type { PricingRuleConfig } from '@/pricing/edit-pricing/components/rules/pricingRuleUtils';

export type QuantityRuleConfig = PricingRuleConfig;

const QUANTITY_RULE_TYPES = [
  { value: 'exact', label: 'exact' },
  { value: 'every', label: 'every' },
  { value: 'minimum', label: 'minimum' },
];

export const QuantityRuleSheet = (props: PricingRuleSheetCallbacks) => (
  <PricingRuleSheet
    {...props}
    addTitle="add-quantity-rule"
    editTitle="edit-quantity-rule"
    defaultRuleType="exact"
    ruleTypeOptions={QUANTITY_RULE_TYPES}
    ruleValueHint="0"
  />
);
