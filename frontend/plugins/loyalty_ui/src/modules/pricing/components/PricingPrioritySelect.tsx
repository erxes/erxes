import {
  PRICING_PRIORITY_OPTIONS,
  PricingPriorityFormValue,
} from '@/pricing/constants';
import { PricingOptionSelect } from '@/pricing/components/PricingOptionSelect';

interface PricingPrioritySelectProps {
  value: PricingPriorityFormValue;
  onValueChange: (value: PricingPriorityFormValue) => void;
}

export const PricingPrioritySelect = ({
  value,
  onValueChange,
}: PricingPrioritySelectProps) => (
  <PricingOptionSelect
    value={value}
    options={PRICING_PRIORITY_OPTIONS}
    placeholder="select-priority"
    onValueChange={onValueChange}
  />
);
