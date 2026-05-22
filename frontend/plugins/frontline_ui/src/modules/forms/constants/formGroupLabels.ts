import { FormGroupKey, FormGroupMetadata } from './formFieldTypes';

export const FORM_GROUP_LABELS: Record<FormGroupKey, FormGroupMetadata> = {
  basic: {
    label: 'Basic Fields',
    description: 'Standard inputs for custom data collection.',
  },
  'core:customer': {
    label: 'Core Fields',
    description: 'Default fields tied directly to the core.',
  },
};
