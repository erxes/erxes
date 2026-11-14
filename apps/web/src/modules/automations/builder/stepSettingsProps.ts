import type { AutomationStep } from '@erxes/core-contract';

/** The inspector's props for one kind of step. */
export type SettingsProps<T extends AutomationStep['type']> = {
  step: Extract<AutomationStep, { type: T }>;
  subject: 'customer' | 'company';
  disabled?: boolean;
  onChange: (step: AutomationStep) => void;
};
