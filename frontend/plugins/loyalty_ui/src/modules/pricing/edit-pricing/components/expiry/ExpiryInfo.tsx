import { type ReactNode } from 'react';
import { IPricingPlanDetail } from '@/pricing/types';
import { PricingRuleInfo } from '@/pricing/edit-pricing/components/rules/PricingRuleInfo';
import {
  ExpiryRuleSheet,
  type ExpiryRuleConfig,
} from '@/pricing/edit-pricing/components/expiry/ExpiryRuleSheet';

interface ExpiryInfoProps {
  pricingId?: string;
  pricingDetail?: IPricingPlanDetail;
  embedded?: boolean;
  onSaveActionChange?: (action: ReactNode | null) => void;
}

export const ExpiryInfo = (props: ExpiryInfoProps) => (
  <PricingRuleInfo<ExpiryRuleConfig>
    {...props}
    title="Expiry"
    rulesKey="expiryRules"
    enabledKey="isExpiryEnabled"
    successTitle="Expiry rules updated"
    errorTitle="Failed to update expiry rules"
    emptyMessage={
      <>
        No expiry rules configured yet. Click "Add rule" to set up expiry
        conditions for this product.
      </>
    }
    RuleSheet={ExpiryRuleSheet}
  />
);
