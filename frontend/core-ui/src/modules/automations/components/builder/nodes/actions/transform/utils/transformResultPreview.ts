import { TActionResultPreview } from '@/automations/components/builder/nodes/types/coreAutomationActionTypes';

export const getTransformResultPreview: TActionResultPreview = (action) => {
  const total = Object.keys(action.result?.data || {}).length;

  return total ? `${total} field${total > 1 ? 's' : ''} produced` : 'No output';
};
