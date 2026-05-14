import { type ReactNode } from 'react';
import { IPricingPlanDetail } from '@/pricing/types';
import { PricingRuleInfo } from '@/pricing/edit-pricing/components/rules/PricingRuleInfo';
import {
  QuantityRuleSheet,
  type QuantityRuleConfig,
} from '@/pricing/edit-pricing/components/quantity/QuantityRuleSheet';

interface QuantityInfoProps {
  pricingId?: string;
  pricingDetail?: IPricingPlanDetail;
  embedded?: boolean;
  onSaveActionChange?: (action: ReactNode | null) => void;
}

export const QuantityInfo = (props: QuantityInfoProps) => (
  <PricingRuleInfo<QuantityRuleConfig>
    {...props}
    title="Quantity"
    rulesKey="quantityRules"
    enabledKey="isQuantityEnabled"
    successTitle="Quantity rules updated"
    errorTitle="Failed to update quantity rules"
    emptyMessage='No quantity rules yet. Click "Add rule" to add one.'
    RuleSheet={QuantityRuleSheet}
  />
);
