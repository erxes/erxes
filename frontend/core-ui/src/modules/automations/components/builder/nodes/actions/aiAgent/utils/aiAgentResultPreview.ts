import { stringifyAutomationHistoryValue } from '@/automations/components/builder/history/components/AutomationHistoryPopoverValue';
import { TActionResultPreview } from '@/automations/components/builder/nodes/types/coreAutomationActionTypes';

export const getAiAgentResultPreview: TActionResultPreview = (action) => {
  const result = action.result || {};

  if (result.type === 'generateText') {
    return result.text || 'Generated text';
  }

  if (result.type === 'splitTopic') {
    return result.topicId
      ? `Matched topic: ${result.topicId}`
      : 'No matching topic';
  }

  if (result.type === 'classification') {
    return stringifyAutomationHistoryValue(result.attributes || {});
  }

  return stringifyAutomationHistoryValue(result);
};
