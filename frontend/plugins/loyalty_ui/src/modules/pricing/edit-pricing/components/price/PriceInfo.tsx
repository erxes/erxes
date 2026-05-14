import { type ReactNode } from 'react';
import { IPricingPlanDetail } from '@/pricing/types';
import { PricingRuleInfo } from '@/pricing/edit-pricing/components/rules/PricingRuleInfo';
import {
  PriceRuleSheet,
  type PriceRuleConfig,
} from '@/pricing/edit-pricing/components/price/PriceRuleSheet';

interface PriceInfoProps {
  pricingId?: string;
  pricingDetail?: IPricingPlanDetail;
  embedded?: boolean;
  onSaveActionChange?: (action: ReactNode | null) => void;
}

export const PriceInfo = (props: PriceInfoProps) => (
  <PricingRuleInfo<PriceRuleConfig>
    {...props}
    title="Price"
    rulesKey="priceRules"
    enabledKey="isPriceEnabled"
    successTitle="Price rules updated"
    errorTitle="Failed to update price rules"
    emptyMessage='No price rules yet. Click "Add rule" to add one.'
    RuleSheet={PriceRuleSheet}
  />
);
