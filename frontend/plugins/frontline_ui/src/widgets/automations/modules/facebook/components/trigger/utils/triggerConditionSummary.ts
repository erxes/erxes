import { IFacebookBot } from '@/integrations/facebook/types/FacebookBot';
import {
  DIRECT_MESSAGE_OPERATOR_TYPES,
  MESSAGE_TRIGGER_CONDITIONS,
} from '../constants/messageTriggerOptions';
import { TCommentTriggerCondition } from '../types/commentTrigger';
import { TMessageTriggerCondition } from '../types/messageTrigger';
import { TTriggerConditionSummaryItem } from '../types/triggerSummary';

const getKeywordTexts = (
  keywords: Array<{
    text: string;
  }> = [],
) => keywords.map(({ text }) => text.trim()).filter(Boolean);

const buildConditionValue = (
  condition: TMessageTriggerCondition,
  bot?: IFacebookBot,
) => {
  if (condition.type === 'direct') {
    const keywords = (condition.conditions || []).flatMap(
      ({ keywords = [] }) => getKeywordTexts(keywords),
    );

    if (!keywords.length) {
      return 'Any direct text message';
    }

    return keywords.join(',');
  }

  if (condition.type === 'persistentMenu') {
    const persistentMenuIds = condition.persistentMenuIds || [];
    const persistentMenus = bot?.persistentMenus || [];

    return persistentMenus
      .filter(({ _id }) => persistentMenuIds.includes(_id))
      .map(({ text }) => text)
      .join(',');
  }

  if (condition.type === 'open_thread') {
    if ((condition.sourceMode || 'all') === 'all') {
      return 'All send message entries';
    }

    return (condition.sourceIds || []).join(',');
  }

  return '';
};

export const buildSelectedConditionSummaries = ({
  conditions = [],
  bot,
}: {
  conditions?: TMessageTriggerCondition[];
  bot?: IFacebookBot;
}): TTriggerConditionSummaryItem[] => {
  return conditions
    .filter(({ isSelected }) => isSelected)
    .map((condition) => {
      const option = MESSAGE_TRIGGER_CONDITIONS.find(
        ({ type }) => type === condition.type,
      );

      return {
        _id: condition._id,
        type: condition.type,
        label: option?.label || condition.type,
        description: option?.description || '',
        value: buildConditionValue(condition, bot),
      };
    });
};

export const buildCommentTriggerConditionSummaries = ({
  conditions = [],
}: {
  conditions?: TCommentTriggerCondition[];
}): TTriggerConditionSummaryItem[] => {
  return conditions.map((condition) => {
    const keywords = getKeywordTexts(condition.keywords);
    const operator = DIRECT_MESSAGE_OPERATOR_TYPES.find(
      ({ value }) => value === condition.operator,
    );

    return {
      _id: condition._id,
      type: 'commentContent',
      label: 'Comment content',
      description: keywords.length
        ? operator?.label || 'Matches keywords'
        : 'No keywords configured',
      value: keywords.join(','),
    };
  });
};
