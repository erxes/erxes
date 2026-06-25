import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
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

export function QuantityInfo(props: QuantityInfoProps) {
  const { t } = useTranslation('loyalty');
  return (
    <PricingRuleInfo<QuantityRuleConfig>
      {...props}
      title={t('quantity')}
      rulesKey="quantityRules"
      enabledKey="isQuantityEnabled"
      successTitle={t('quantity-rules-updated')}
      errorTitle={t('failed-to-update-quantity-rules')}
      emptyMessage={<>{t('no-quantity-rules')}</>}
      RuleSheet={QuantityRuleSheet}
    />
  );
}
