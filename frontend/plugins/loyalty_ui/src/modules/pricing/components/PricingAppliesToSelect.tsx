import { PRICING_APPLIES_TO_OPTIONS } from '@/pricing/constants';
import { PricingOptionSelect } from '@/pricing/components/PricingOptionSelect';
import { PricingAppliesTo } from '@/pricing/types';

interface PricingAppliesToSelectProps {
  value: PricingAppliesTo;
  onValueChange: (value: PricingAppliesTo) => void;
  triggerClassName?: string;
}

export const PricingAppliesToSelect = ({
  value,
  onValueChange,
  triggerClassName,
}: PricingAppliesToSelectProps) => (
  <PricingOptionSelect
    value={value}
    options={PRICING_APPLIES_TO_OPTIONS}
    placeholder="select-target"
    onValueChange={onValueChange}
    triggerClassName={triggerClassName}
  />
);
