import { Button } from 'erxes-ui';
import { useDirectMessageEditor } from '../../hooks/useDirectMessageEditor';
import { TMessageTriggerDirectConditions } from '../../types/messageTrigger';
import { DirectMessageConditionCard } from './DirectMessageConditionCard';
import { DirectMessageEmptyState } from './DirectMessageEmptyState';

type Props = {
  conditions: TMessageTriggerDirectConditions;
  onConditionChange: (
    fieldName: 'persistentMenuIds' | 'conditions',
    fieldValue: TMessageTriggerDirectConditions | string[],
  ) => void;
};

export const DirectMessageEditor = ({
  conditions = [],
  onConditionChange,
}: Props) => {
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
        When no conditions are added, this trigger will run for any incoming
        direct text message.
      </p>

      <div className="flex justify-end">
        <Button variant="ghost" onClick={addCondition}>
          + Add optional condition
        </Button>
      </div>

      {conditions.map((condition) => (
        <DirectMessageConditionCard
          key={condition._id}
          condition={condition}
          onChange={(name, value) =>
            updateCondition(condition._id, name, value)
          }
          onRemove={() => removeCondition(condition._id)}
        />
      ))}
    </div>
  );
};
