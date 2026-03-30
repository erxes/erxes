import { useFormContext } from 'react-hook-form';
import { MESSAGE_TRIGGER_CONDITIONS } from '../../constants/messageTriggerOptions';
import { useMessageTriggerFormContext } from '../../context/MessageTriggerFormContext';
import { useMessageTriggerConditions } from '../../hooks/useMessageTriggerConditions';
import { TMessageTriggerForm } from '../../types/messageTrigger';
import { getConditionsFieldErrors } from '../../utils/triggerConditionErrors';
import { MessageTriggerConditionCard } from './MessageTriggerConditionCard';

export const MessageTriggerConditionsList = () => {
  const { formState } = useFormContext<TMessageTriggerForm>();
  const { setActiveConditionType } = useMessageTriggerFormContext();
  const { selectedConditionTypes, updateCondition } =
    useMessageTriggerConditions();

  const errors = getConditionsFieldErrors(formState.errors);

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
            onCheck={(checked) => updateCondition(type, 'isSelected', checked)}
            onOpen={() => setActiveConditionType(type)}
          />
        ),
      )}
    </div>
  );
};
