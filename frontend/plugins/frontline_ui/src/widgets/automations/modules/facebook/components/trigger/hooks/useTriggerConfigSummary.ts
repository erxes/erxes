import { useFacebookBot } from '@/integrations/facebook/hooks/useFacebookBots';
import { buildSelectedConditionSummaries } from '../utils/triggerConditionSummary';
import {
  TTriggerConfigContentConfig,
  TTriggerConfigSummaryResult,
} from '../types/triggerSummary';

export const useTriggerConfigSummary = (
  config?: TTriggerConfigContentConfig,
): TTriggerConfigSummaryResult => {
  const { botId = '', conditions = [] } = config || {};
  const { bot, loading } = useFacebookBot(botId);

  return {
    bot,
    loading,
    conditionSummaries: buildSelectedConditionSummaries({
      conditions,
      bot,
    }),
  };
};
