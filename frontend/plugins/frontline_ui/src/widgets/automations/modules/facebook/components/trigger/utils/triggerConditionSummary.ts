import { IFacebookBot } from '@/integrations/facebook/types/FacebookBot';
import { MESSAGE_TRIGGER_CONDITIONS } from '../constants/messageTriggerOptions';
import { TMessageTriggerCondition } from '../types/messageTrigger';
import { TTriggerConditionSummaryItem } from '../types/triggerSummary';

const buildConditionValue = (
  condition: TMessageTriggerCondition,
  bot?: IFacebookBot,
) => {
  if (condition.type === 'direct') {
    const keywords = (condition.conditions || [])
      .flatMap(({ keywords = [] }) => keywords.map(({ text }) => text))
      .filter((text) => text.trim().length > 0);

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
