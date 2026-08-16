import { TActionResultPreview } from '@/automations/components/builder/nodes/types/coreAutomationActionTypes';

export const getWaitEventResultPreview: TActionResultPreview = (action) =>
  action.result?.description || 'Waiting for an event';
