import { InfoCard } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { IPricingPlanDetail } from '@/pricing/types';
import { CommonRuleInfo } from '@/pricing/edit-pricing/components/rules/CommonRuleInfo';
import { QuantityInfo } from '@/pricing/edit-pricing/components/quantity/QuantityInfo';
import { PriceInfo } from '@/pricing/edit-pricing/components/price/PriceInfo';
import { ExpiryInfo } from '@/pricing/edit-pricing/components/expiry/ExpiryInfo';

export type PricingRuleType = 'common' | 'quantity' | 'price' | 'expiry';

interface RulesInfoProps {
  pricingId?: string;
  pricingDetail?: IPricingPlanDetail;
  activeStep?: string;
}

const PRICING_RULE_TYPES = new Set<string>([
  'common',
  'quantity',
  'price',
  'expiry',
]);

const isPricingRuleType = (value?: string): value is PricingRuleType => {
  if (!value) {
    return false;
  }

  return PRICING_RULE_TYPES.has(value);
};

export const RulesInfo = ({
  pricingId,
  pricingDetail,
  activeStep,
}: RulesInfoProps) => {
  const { t } = useTranslation('loyalty');
  const currentRule = isPricingRuleType(activeStep) ? activeStep : 'common';

  const renderRuleContent = () => {
    switch (currentRule) {
      case 'quantity':
        return (
          <QuantityInfo pricingId={pricingId} pricingDetail={pricingDetail} />
        );
      case 'price':
        return (
          <PriceInfo pricingId={pricingId} pricingDetail={pricingDetail} />
        );
      case 'expiry':
        return (
          <ExpiryInfo pricingId={pricingId} pricingDetail={pricingDetail} />
        );
      default:
        return (
          <CommonRuleInfo pricingId={pricingId} pricingDetail={pricingDetail} />
        );
    }
  };

  return (
    <div className="p-6">
      <InfoCard title={t(currentRule)}>
        <InfoCard.Content className="space-y-4">
          {renderRuleContent()}
        </InfoCard.Content>
      </InfoCard>
    </div>
  );
};
