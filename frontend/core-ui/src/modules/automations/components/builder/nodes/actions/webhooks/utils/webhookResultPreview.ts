import { TActionResultPreview } from '@/automations/components/builder/nodes/types/coreAutomationActionTypes';

export const getWebhookResultPreview: TActionResultPreview = (action) => {
  const { response } = action.result || {};

  return `${response?.status ?? 'N/A'} ${response?.statusText || ''}`.trim();
};
