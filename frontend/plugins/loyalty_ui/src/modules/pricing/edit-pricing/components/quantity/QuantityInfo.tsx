import { useTranslation } from 'react-i18next';
import { IPricingPlanDetail } from '@/pricing/types';
import { PricingRuleInfo } from '@/pricing/edit-pricing/components/rules/PricingRuleInfo';
import { QuantityRuleSheet } from '@/pricing/edit-pricing/components/quantity/QuantityRuleSheet';

interface QuantityInfoProps {
  pricingId?: string;
  pricingDetail?: IPricingPlanDetail;
}

export function QuantityInfo(props: QuantityInfoProps) {
  const { t } = useTranslation('loyalty');
  return (
    <PricingRuleInfo
      {...props}
      title={t('quantity')}
      ruleType="quantity"
      successTitle={t('quantity-rules-updated')}
      errorTitle={t('failed-to-update-quantity-rules')}
      RuleSheet={QuantityRuleSheet}
    />
  );
}
