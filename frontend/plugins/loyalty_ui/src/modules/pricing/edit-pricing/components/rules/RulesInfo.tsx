import { type ReactNode } from 'react';
import { InfoCard, Tabs } from 'erxes-ui';
import { useSearchParams } from 'react-router-dom';
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
  onSaveActionChange?: (action: ReactNode | null) => void;
}

const RULE_TABS: { value: PricingRuleType; label: string }[] = [
  { value: 'common', label: 'Common' },
  { value: 'quantity', label: 'Quantity' },
  { value: 'price', label: 'Price' },
  { value: 'expiry', label: 'Expiry' },
];

const isPricingRuleType = (value?: string): value is PricingRuleType =>
  RULE_TABS.some((tab) => tab.value === value);

export const RulesInfo = ({
  pricingId,
  pricingDetail,
  activeStep,
  onSaveActionChange,
}: RulesInfoProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeRuleParam = searchParams.get('activeTab') || undefined;
  const currentRule = isPricingRuleType(activeRuleParam)
    ? activeRuleParam
    : isPricingRuleType(activeStep)
    ? activeStep
    : 'common';

  const handleTabChange = (value: string) => {
    setSearchParams((prev) => {
      const nextParams = new URLSearchParams(prev);
      nextParams.set('activeTab', value);
      return nextParams;
    });
  };

  const renderRuleContent = () => {
    switch (currentRule) {
      case 'quantity':
        return (
          <QuantityInfo
            pricingId={pricingId}
            pricingDetail={pricingDetail}
            embedded
            onSaveActionChange={onSaveActionChange}
          />
        );
      case 'price':
        return (
          <PriceInfo
            pricingId={pricingId}
            pricingDetail={pricingDetail}
            embedded
            onSaveActionChange={onSaveActionChange}
          />
        );
      case 'expiry':
        return (
          <ExpiryInfo
            pricingId={pricingId}
            pricingDetail={pricingDetail}
            embedded
            onSaveActionChange={onSaveActionChange}
          />
        );
      case 'common':
      default:
        return (
          <CommonRuleInfo
            pricingId={pricingId}
            pricingDetail={pricingDetail}
            embedded
            onSaveActionChange={onSaveActionChange}
          />
        );
    }
  };

  return (
    <div className="p-6">
      <InfoCard title="Rules">
        <InfoCard.Content className="space-y-4">
          <Tabs value={currentRule} onValueChange={handleTabChange}>
            <Tabs.List className="w-fit">
              {RULE_TABS.map((tab) => (
                <Tabs.Trigger key={tab.value} value={tab.value}>
                  {tab.label}
                </Tabs.Trigger>
              ))}
            </Tabs.List>

            <div className="pt-4 border-t">{renderRuleContent()}</div>
          </Tabs>
        </InfoCard.Content>
      </InfoCard>
    </div>
  );
};
