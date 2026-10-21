import { FormGroupKey, FormGroupMetadata } from './formFieldTypes';

export const FORM_GROUP_LABELS: Record<FormGroupKey, FormGroupMetadata> = {
  basic: {
    labelKey: 'basic-fields',
    description: 'Standard inputs for custom data collection.',
  },
  'core:customer': {
    labelKey: 'core-fields',
    description: 'Default fields tied directly to the core.',
  },
};
