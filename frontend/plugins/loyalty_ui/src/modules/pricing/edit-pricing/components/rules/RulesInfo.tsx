import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { InfoCard, Tabs } from 'erxes-ui';
import { IconCircleCheckFilled } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { IPricingPlanDetail } from '@/pricing/types';
import { CommonRuleInfo } from '@/pricing/edit-pricing/components/rules/CommonRuleInfo';
import { QuantityInfo } from '@/pricing/edit-pricing/components/quantity/QuantityInfo';
import { PriceInfo } from '@/pricing/edit-pricing/components/price/PriceInfo';
import { ExpiryInfo } from '@/pricing/edit-pricing/components/expiry/ExpiryInfo';

export type PricingRuleType = 'common' | 'quantity' | 'price' | 'expiry';
type EnabledRuleType = Exclude<PricingRuleType, 'common'>;

interface RulesInfoProps {
  pricingId?: string;
  pricingDetail?: IPricingPlanDetail;
  activeStep?: string;
  onSaveActionChange?: (action: ReactNode | null) => void;
}

const RULE_TABS: { value: PricingRuleType; label: string }[] = [
  { value: 'common', label: 'common' },
  { value: 'quantity', label: 'quantity' },
  { value: 'price', label: 'price' },
  { value: 'expiry', label: 'expiry' },
];

const isPricingRuleType = (value?: string): value is PricingRuleType =>
  RULE_TABS.some((tab) => tab.value === value);

export const RulesInfo = ({
  pricingId,
  pricingDetail,
  activeStep,
  onSaveActionChange,
}: RulesInfoProps) => {
  const { t } = useTranslation('loyalty');
  const [searchParams, setSearchParams] = useSearchParams();
  const [saveActions, setSaveActions] = useState<
    Record<PricingRuleType, ReactNode | null>
  >({
    common: null,
    quantity: null,
    price: null,
    expiry: null,
  });
  const [enabledRules, setEnabledRules] = useState<
    Record<EnabledRuleType, boolean>
  >({
    quantity: false,
    price: false,
    expiry: false,
  });
  const activeRuleParam = searchParams.get('activeTab') || undefined;
  let currentRule: PricingRuleType = 'common';

  if (isPricingRuleType(activeRuleParam)) {
    currentRule = activeRuleParam;
  } else if (isPricingRuleType(activeStep)) {
    currentRule = activeStep;
  }

  const handleTabChange = (value: string) => {
    setSearchParams((prev) => {
      const nextParams = new URLSearchParams(prev);
      nextParams.set('activeTab', value);
      return nextParams;
    });
  };

  const handleSaveActionChange = useCallback(
    (ruleType: PricingRuleType) => (action: ReactNode | null) => {
      setSaveActions((currentActions) =>
        currentActions[ruleType] === action
          ? currentActions
          : {
              ...currentActions,
              [ruleType]: action,
            },
      );
    },
    [],
  );

  const saveActionHandlers = useMemo(
    () => ({
      common: handleSaveActionChange('common'),
      quantity: handleSaveActionChange('quantity'),
      price: handleSaveActionChange('price'),
      expiry: handleSaveActionChange('expiry'),
    }),
    [handleSaveActionChange],
  );

  useEffect(() => {
    setEnabledRules({
      quantity: Boolean(pricingDetail?.isQuantityEnabled),
      price: Boolean(pricingDetail?.isPriceEnabled),
      expiry: Boolean(pricingDetail?.isExpiryEnabled),
    });
  }, [
    pricingDetail?.isExpiryEnabled,
    pricingDetail?.isPriceEnabled,
    pricingDetail?.isQuantityEnabled,
  ]);

  const handleEnabledChange = useCallback(
    (ruleType: EnabledRuleType) => (enabled: boolean) => {
      setEnabledRules((currentRules) => ({
        ...currentRules,
        [ruleType]: enabled,
      }));
    },
    [],
  );

  const enabledChangeHandlers = useMemo(
    () => ({
      quantity: handleEnabledChange('quantity'),
      price: handleEnabledChange('price'),
      expiry: handleEnabledChange('expiry'),
    }),
    [handleEnabledChange],
  );

  useEffect(() => {
    if (!onSaveActionChange) {
      return;
    }

    onSaveActionChange(saveActions[currentRule]);

    return () => onSaveActionChange(null);
  }, [currentRule, onSaveActionChange, saveActions]);

  return (
    <div className="p-6">
      <InfoCard title={t('rules')}>
        <InfoCard.Content className="space-y-4">
          <Tabs value={currentRule} onValueChange={handleTabChange}>
            <Tabs.List className="w-fit">
              {RULE_TABS.map((tab) => (
                <Tabs.Trigger key={tab.value} value={tab.value}>
                  <span className="inline-flex items-center gap-1.5">
                    {t(tab.label)}
                    {tab.value !== 'common' && enabledRules[tab.value] && (
                      <IconCircleCheckFilled className="size-3 text-success" />
                    )}
                  </span>
                </Tabs.Trigger>
              ))}
            </Tabs.List>

            <Tabs.Content
              value="common"
              forceMount
              className="pt-4 border-t data-[state=inactive]:hidden"
            >
              <CommonRuleInfo
                pricingId={pricingId}
                pricingDetail={pricingDetail}
                embedded
                onSaveActionChange={saveActionHandlers.common}
              />
            </Tabs.Content>

            <Tabs.Content
              value="quantity"
              forceMount
              className="pt-4 border-t data-[state=inactive]:hidden"
            >
              <QuantityInfo
                pricingId={pricingId}
                pricingDetail={pricingDetail}
                embedded
                onSaveActionChange={saveActionHandlers.quantity}
                onEnabledChange={enabledChangeHandlers.quantity}
              />
            </Tabs.Content>

            <Tabs.Content
              value="price"
              forceMount
              className="pt-4 border-t data-[state=inactive]:hidden"
            >
              <PriceInfo
                pricingId={pricingId}
                pricingDetail={pricingDetail}
                embedded
                onSaveActionChange={saveActionHandlers.price}
                onEnabledChange={enabledChangeHandlers.price}
              />
            </Tabs.Content>

            <Tabs.Content
              value="expiry"
              forceMount
              className="pt-4 border-t data-[state=inactive]:hidden"
            >
              <ExpiryInfo
                pricingId={pricingId}
                pricingDetail={pricingDetail}
                embedded
                onSaveActionChange={saveActionHandlers.expiry}
                onEnabledChange={enabledChangeHandlers.expiry}
              />
            </Tabs.Content>
          </Tabs>
        </InfoCard.Content>
      </InfoCard>
    </div>
  );
};
