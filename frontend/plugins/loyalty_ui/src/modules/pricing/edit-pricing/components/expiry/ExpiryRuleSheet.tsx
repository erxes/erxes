import {
  PricingRuleSheet,
  type PricingRuleSheetCallbacks,
} from '@/pricing/edit-pricing/components/rules/PricingRuleSheet';
import type { PricingRuleConfig } from '@/pricing/edit-pricing/components/rules/pricingRuleUtils';

export type ExpiryRuleConfig = PricingRuleConfig;

const EXPIRY_RULE_TYPES = [
  { value: 'hour', label: 'hour' },
  { value: 'day', label: 'day' },
  { value: 'week', label: 'week' },
  { value: 'month', label: 'month' },
  { value: 'year', label: 'year' },
];

export const ExpiryRuleSheet = (props: PricingRuleSheetCallbacks) => (
  <PricingRuleSheet
    {...props}
    addTitle="add-new-expiry-rule"
    editTitle="edit-expiry-rule"
    defaultRuleType="hour"
    ruleTypeOptions={EXPIRY_RULE_TYPES}
    ruleValueHint="enter-number"
    translateRuleValueHint
  />
);
