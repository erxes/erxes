import { Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useDirectMessageEditor } from '../../hooks/useDirectMessageEditor';
import { useFacebookBotTriggerClaims } from '../../hooks/useFacebookBotTriggerClaims';
import { TMessageTriggerDirectConditions } from '../../types/messageTrigger';
import { DirectMessageConditionCard } from './DirectMessageConditionCard';
import { DirectMessageEmptyState } from './DirectMessageEmptyState';

type Props = {
  // Absent for the comment trigger, which reuses this editor without a bot;
  // claims are then empty.
  botId?: string;
  currentTriggerId?: string;
  conditions: TMessageTriggerDirectConditions;
  onConditionChange: (
    fieldName: 'persistentMenuIds' | 'conditions',
    fieldValue: TMessageTriggerDirectConditions | string[],
  ) => void;
};

export const DirectMessageEditor = ({
  botId,
  currentTriggerId,
  conditions,
  onConditionChange,
}: Props) => {
  const { t } = useTranslation('frontline');
  const { claims } = useFacebookBotTriggerClaims(botId, currentTriggerId);
  const { hasConditions, addCondition, removeCondition, updateCondition } =
    useDirectMessageEditor({
      conditions,
      onConditionChange,
    });

  if (!hasConditions) {
    return <DirectMessageEmptyState onAddFirstCondition={addCondition} />;
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        {t('no-conditions-description')}
      </p>

      <div className="flex justify-end">
        <Button variant="ghost" onClick={addCondition}>
          {t('add-optional-condition')}
        </Button>
      </div>

      {conditions.map((condition) => (
        <DirectMessageConditionCard
          key={condition._id}
          condition={condition}
          keywordClaims={claims.directKeywords}
          onChange={(name, value) =>
            updateCondition(condition._id, name, value)
          }
          onRemove={() => removeCondition(condition._id)}
        />
      ))}
    </div>
  );
};
