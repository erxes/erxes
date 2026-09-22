import { TActionResultPreview } from '@/automations/components/builder/nodes/types/coreAutomationActionTypes';

export const getWebhookResultPreview: TActionResultPreview = (action) => {
  const { response, error, meta } = action.result || {};
  const attemptCount = meta?.attemptCount || error?.attemptCount;

  if (error) {
    const message = error.message || error.phase || 'Request failed';

    return attemptCount ? `${message} (${attemptCount} attempts)` : message;
  }

  return `${response?.status ?? 'N/A'} ${response?.statusText || ''}`.trim();
};
