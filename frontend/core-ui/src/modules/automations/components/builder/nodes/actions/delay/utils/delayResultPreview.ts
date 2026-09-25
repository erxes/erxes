import { TActionResultPreview } from '@/automations/components/builder/nodes/types/coreAutomationActionTypes';

export const getDelayResultPreview: TActionResultPreview = (action) => {
  const { value, type } = action?.actionConfig || {};

  return value && type ? `Delaying for: ${value} ${type}s` : 'Delaying';
};
