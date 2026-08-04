import { generateAutomationElementId } from 'ui-modules';
import { TMessageTriggerDirectConditions } from '../types/messageTrigger';

type Props = {
  conditions: TMessageTriggerDirectConditions;
  onConditionChange: (
    fieldName: 'persistentMenuIds' | 'conditions',
    fieldValue: TMessageTriggerDirectConditions | string[],
  ) => void;
};

export const useDirectMessageEditor = ({
  conditions = [],
  onConditionChange,
}: Props) => {
  const hasConditions = conditions.length > 0;

  const addCondition = () => {
    onConditionChange('conditions', [
      ...conditions,
      { _id: generateAutomationElementId(), operator: '', keywords: [] },
    ]);
  };

  const removeCondition = (id: string) => {
    onConditionChange(
      'conditions',
      conditions.filter((condition) => condition._id !== id),
    );
  };

  const updateCondition = (
    conditionId: string,
    name: 'operator' | 'keywords',
    value:
      | TMessageTriggerDirectConditions[number]['keywords']
      | TMessageTriggerDirectConditions[number]['operator'],
  ) => {
    onConditionChange(
      'conditions',
      conditions.map((condition) =>
        condition._id === conditionId
          ? { ...condition, [name]: value }
          : condition,
      ),
    );
  };

  return {
    conditions,
    hasConditions,
    addCondition,
    removeCondition,
    updateCondition,
  };
};
