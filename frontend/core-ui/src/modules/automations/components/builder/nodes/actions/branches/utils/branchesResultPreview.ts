import { TActionResultPreview } from '@/automations/components/builder/nodes/types/coreAutomationActionTypes';

export const getBranchesResultPreview: TActionResultPreview = (action) =>
  action.result?.condition
    ? `Condition: ${action.result.condition}`
    : 'No condition matched';
