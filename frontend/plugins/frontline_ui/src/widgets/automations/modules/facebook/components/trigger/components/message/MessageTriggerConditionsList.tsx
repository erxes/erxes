import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useFacebookBot } from '@/integrations/facebook/hooks/useFacebookBots';
import { useFacebookBotTriggerClaims } from '../../hooks/useFacebookBotTriggerClaims';
import { buildConditionValue } from '../../utils/triggerConditionSummary';
import { MESSAGE_TRIGGER_CONDITIONS } from '../../constants/messageTriggerOptions';
import { useMessageTriggerFormContext } from '../../context/MessageTriggerFormContext';
import { useMessageTriggerConditions } from '../../hooks/useMessageTriggerConditions';
import { TMessageTriggerForm } from '../../types/messageTrigger';
import { getConditionsFieldErrors } from '../../utils/triggerConditionErrors';
import { MessageTriggerConditionCard } from './MessageTriggerConditionCard';

export const MessageTriggerConditionsList = ({
  currentTriggerId,
}: {
  currentTriggerId?: string;
}) => {
  const { t } = useTranslation('frontline');
  const { formState, watch } = useFormContext<TMessageTriggerForm>();
  const botId = watch('botId');
  const { claims } = useFacebookBotTriggerClaims(botId, currentTriggerId);
  const { bot } = useFacebookBot(botId);
  const { setActiveConditionType } = useMessageTriggerFormContext();
  const { conditions, selectedConditionTypes, updateCondition } =
    useMessageTriggerConditions();

  const errors = getConditionsFieldErrors(formState.errors);

  // A condition that carries its own configuration cannot be turned on while
  // that configuration is empty; the card still opens so it can be filled in.
  const getConfigHint = (type: string) => {
    const condition = conditions.find((item) => item.type === type);

    if (type === 'persistentMenu' && !condition?.persistentMenuIds?.length) {
      return t('condition-needs-persistent-menu', {
        defaultValue: 'Open it and pick at least one menu item first.',
      });
    }

    if (type === 'iceBreaker' && !condition?.iceBreakerIds?.length) {
      return t('condition-needs-ice-breaker', {
        defaultValue: 'Open it and pick at least one ice breaker first.',
      });
    }

    return undefined;
  };

  // A catch-all elsewhere only collides with another catch-all. Once this
  // trigger names its own keywords it is no longer answering every message, so
  // the block lifts and only identical keywords stay blocked.
  const hasOwnKeywords = (
    conditions.find(({ type }) => type === 'direct')?.conditions || []
  ).some(({ keywords }) => (keywords || []).length > 0);

  return (
    <div className="flex flex-col gap-2 p-4">
      {MESSAGE_TRIGGER_CONDITIONS.map(
        ({ label, description, type, icon: Icon }) => (
          <MessageTriggerConditionCard
            key={type}
            type={type}
            label={label}
            description={description}
            icon={Icon}
            isSelected={selectedConditionTypes.includes(type)}
            errorMessage={errors[type]}
            claims={
              type === 'getStarted'
                ? claims.getStarted
                : type === 'direct' && !hasOwnKeywords
                  ? claims.directCatchAll
                  : undefined
            }
            configHint={getConfigHint(type)}
            summary={(() => {
              const condition = conditions.find((item) => item.type === type);

              return condition ? buildConditionValue(condition, bot) : '';
            })()}
            onCheck={(checked) => updateCondition(type, 'isSelected', checked)}
            onOpen={() => setActiveConditionType(type)}
          />
        ),
      )}
    </div>
  );
};
