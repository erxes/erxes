import { useFacebookBot } from '@/integrations/facebook/hooks/useFacebookBots';
import { TCommentTriggerCondition } from '../types/commentTrigger';
import { TMessageTriggerCondition } from '../types/messageTrigger';
import {
  TTriggerConfigContentConfig,
  TTriggerConfigSummaryResult,
} from '../types/triggerSummary';
import {
  buildCommentTriggerConditionSummaries,
  buildSelectedConditionSummaries,
} from '../utils/triggerConditionSummary';

const isCommentTriggerCondition = (
  condition: TCommentTriggerCondition | TMessageTriggerCondition,
): condition is TCommentTriggerCondition => !('type' in condition);

const getCommentConditions = (
  config?: TTriggerConfigContentConfig,
): TCommentTriggerCondition[] =>
  (config?.conditions || []).filter(isCommentTriggerCondition);

const getMessageConditions = (
  config?: TTriggerConfigContentConfig,
): TMessageTriggerCondition[] =>
  (config?.conditions || []).filter(
    (condition): condition is TMessageTriggerCondition =>
      !isCommentTriggerCondition(condition),
  );

export const useTriggerConfigSummary = (
  config?: TTriggerConfigContentConfig,
  contentType?: string,
): TTriggerConfigSummaryResult => {
  const { botId = '' } = config || {};
  const { bot, loading } = useFacebookBot(botId);
  const commentConditions = getCommentConditions(config);
  const isCommentTrigger =
    contentType === 'comments' || commentConditions.length > 0;

  return {
    bot,
    loading,
    conditionSummaries: isCommentTrigger
      ? buildCommentTriggerConditionSummaries({
          conditions: commentConditions,
        })
      : buildSelectedConditionSummaries({
          conditions: getMessageConditions(config),
          bot,
        }),
  };
};
