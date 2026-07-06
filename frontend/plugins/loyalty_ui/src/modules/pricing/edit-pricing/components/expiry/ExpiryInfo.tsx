import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
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
  onEnabledChange?: (enabled: boolean) => void;
}

export const ExpiryInfo = (props: ExpiryInfoProps) => {
  const { t } = useTranslation('loyalty');
  return (
    <PricingRuleInfo<ExpiryRuleConfig>
      {...props}
      title={t('expiry', 'Expiry')}
      rulesKey="expiryRules"
      enabledKey="isExpiryEnabled"
      successTitle={t('expiry-rules-updated', 'Expiry rules updated')}
      errorTitle={t('failed-to-update-expiry-rules', 'Failed to update expiry rules')}
      emptyMessage={<>{t('no-expiry-rules', 'No expiry rules configured yet. Click "Add rule" to set up expiry conditions for this product.')}</>}
      RuleSheet={ExpiryRuleSheet}
    />
  );
};
