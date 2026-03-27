import { IconChevronLeft } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useFormContext } from 'react-hook-form';
import { useMessageTriggerFormContext } from '../../context/MessageTriggerFormContext';
import { useMessageTriggerConditions } from '../../hooks/useMessageTriggerConditions';
import { TMessageTriggerForm } from '../../types/messageTrigger';
import { DirectMessageEditor } from './DirectMessageEditor';
import { PersistentMenuSelector } from './PersistentMenuSelector';

export const MessageTriggerConfigPanel = () => {
  const { watch } = useFormContext<TMessageTriggerForm>();
  const { activeConditionType, setActiveConditionType } =
    useMessageTriggerFormContext();
  const { conditions, updateCondition } = useMessageTriggerConditions();
  const botId = watch('botId');

  if (!activeConditionType) {
    return null;
  }

  const currentCondition = conditions.find(
    ({ type }) => type === activeConditionType,
  );

  return (
    <div className="m-4 border border-md px-4 py-2">
      <Button variant="ghost" onClick={() => setActiveConditionType('')}>
        <IconChevronLeft />
        Back to conditions
      </Button>

      {activeConditionType === 'direct' ? (
        <DirectMessageEditor
          conditions={currentCondition?.conditions || []}
          onConditionChange={(fieldName, fieldValue) =>
            updateCondition(
              activeConditionType,
              fieldName,
              fieldValue as any,
            )
          }
        />
      ) : null}

      {activeConditionType === 'persistentMenu' ? (
        <PersistentMenuSelector
          botId={botId}
          selectedPersistentMenuIds={currentCondition?.persistentMenuIds}
          onConditionChange={(fieldName, fieldValue) =>
            updateCondition(
              activeConditionType,
              fieldName,
              fieldValue as any,
            )
          }
        />
      ) : null}
    </div>
  );
};
