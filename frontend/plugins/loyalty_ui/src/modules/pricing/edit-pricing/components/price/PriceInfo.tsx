import { useTranslation } from 'react-i18next';
import { IPricingPlanDetail } from '@/pricing/types';
import { PricingRuleInfo } from '@/pricing/edit-pricing/components/rules/PricingRuleInfo';
import { PriceRuleSheet } from '@/pricing/edit-pricing/components/price/PriceRuleSheet';

interface PriceInfoProps {
  pricingId?: string;
  pricingDetail?: IPricingPlanDetail;
}

export function PriceInfo(props: PriceInfoProps) {
  const { t } = useTranslation('loyalty');
  return (
    <PricingRuleInfo
      {...props}
      title={t('price')}
      ruleType="price"
      successTitle={t('price-rules-updated')}
      errorTitle={t('failed-to-update-price-rules')}
      RuleSheet={PriceRuleSheet}
    />
  );
}
