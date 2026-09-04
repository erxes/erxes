import { useTranslation } from 'react-i18next';
import { IPricingPlanDetail } from '@/pricing/types';
import { PricingRuleInfo } from '@/pricing/edit-pricing/components/rules/PricingRuleInfo';
import { ExpiryRuleSheet } from '@/pricing/edit-pricing/components/expiry/ExpiryRuleSheet';

interface ExpiryInfoProps {
  pricingId?: string;
  pricingDetail?: IPricingPlanDetail;
}

export const ExpiryInfo = (props: ExpiryInfoProps) => {
  const { t } = useTranslation('loyalty');
  return (
    <PricingRuleInfo
      {...props}
      title={t('expiry')}
      ruleType="expiry"
      successTitle={t('expiry-rules-updated')}
      errorTitle={t('failed-to-update-expiry-rules')}
      RuleSheet={ExpiryRuleSheet}
    />
  );
};
