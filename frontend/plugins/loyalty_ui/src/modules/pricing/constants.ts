import type { PricingPriority } from './types';

export type PricingPriorityFormValue = 'none' | 'public' | 'posBase';

export const PRICING_PRIORITY_OPTIONS: Array<{
  value: PricingPriorityFormValue;
  label: string;
}> = [
  { value: 'none', label: 'none' },
  { value: 'public', label: 'public' },
  { value: 'posBase', label: 'pos-base' },
];

export const priorityToFormValue = (
  priority?: PricingPriority,
): PricingPriorityFormValue => priority || 'none';

export const priorityFromFormValue = (
  priority: PricingPriorityFormValue,
): PricingPriority => (priority === 'none' ? '' : priority);

export const priorityLabelKey = (priority?: PricingPriority | 'none') => {
  if (!priority || priority === 'none') {
    return 'none';
  }

  return priority === 'posBase' ? 'pos-base' : priority;
};
