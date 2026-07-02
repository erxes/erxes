import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
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

export function PriceInfo(props: PriceInfoProps) {
  const { t } = useTranslation('loyalty');
  return (
    <PricingRuleInfo<PriceRuleConfig>
      {...props}
      title={t('price')}
      rulesKey="priceRules"
      enabledKey="isPriceEnabled"
      successTitle={t('price-rules-updated')}
      errorTitle={t('failed-to-update-price-rules')}
      emptyMessage={<>{t('no-price-rules')}</>}
      RuleSheet={PriceRuleSheet}
    />
  );
}
