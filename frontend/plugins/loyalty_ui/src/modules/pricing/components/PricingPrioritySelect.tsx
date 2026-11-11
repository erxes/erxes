import {
  PRICING_PRIORITY_OPTIONS,
  PricingPriorityFormValue,
} from '@/pricing/constants';
import { PricingOptionSelect } from '@/pricing/components/PricingOptionSelect';

interface PricingPrioritySelectProps {
  value: PricingPriorityFormValue;
  onValueChange: (value: PricingPriorityFormValue) => void;
  // A scheduled plan keeps no priority: public and base prices are written ahead of time.
  scheduled?: boolean;
}

const PRIORITIES_WRITTEN_AHEAD: PricingPriorityFormValue[] = [
  'public',
  'posBase',
  'pipelineBase',
];

export const PricingPrioritySelect = ({
  value,
  onValueChange,
  scheduled,
}: PricingPrioritySelectProps) => (
  <PricingOptionSelect
    value={value}
    options={PRICING_PRIORITY_OPTIONS}
    placeholder="select-priority"
    onValueChange={onValueChange}
    disabledValues={scheduled ? PRIORITIES_WRITTEN_AHEAD : []}
  />
);
