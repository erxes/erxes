import { useFormContext } from 'react-hook-form';
import { generateAutomationElementId } from 'ui-modules';
import {
  TMessageTriggerCondition,
  TMessageTriggerDirectConditions,
  TMessageTriggerForm,
  TMessageTriggerPersistentMenuIds,
  TMessageTriggerSourceIds,
  TMessageTriggerSourceMode,
} from '../types/messageTrigger';

export const useMessageTriggerConditions = () => {
  const { watch, setValue } = useFormContext<TMessageTriggerForm>();
  const conditions = watch('conditions') || [];

  const updateCondition = (
    conditionType: string,
    fieldName:
      | 'persistentMenuIds'
      | 'conditions'
      | 'isSelected'
      | 'sourceMode'
      | 'sourceIds',
    fieldValue:
      | TMessageTriggerDirectConditions
      | TMessageTriggerPersistentMenuIds
      | TMessageTriggerSourceMode
      | TMessageTriggerSourceIds
      | boolean,
  ) => {
    const condition = conditions.find(({ type }) => type === conditionType);

    if (!condition) {
      setValue('conditions', [
        ...conditions,
        {
          _id: generateAutomationElementId(),
          type: conditionType,
          [fieldName]: fieldValue,
        } as TMessageTriggerCondition,
      ]);

      return;
    }

    setValue(
      'conditions',
      conditions.map((currentCondition) =>
        currentCondition.type === conditionType
          ? { ...currentCondition, [fieldName]: fieldValue }
          : currentCondition,
      ),
    );
  };

  return {
    conditions,
    selectedConditionTypes: conditions
      .filter(({ isSelected }) => isSelected)
      .map(({ type }) => type),
    updateCondition,
  };
};
