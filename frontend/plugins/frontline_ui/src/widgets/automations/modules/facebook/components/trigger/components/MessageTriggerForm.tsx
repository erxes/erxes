import { zodResolver } from '@hookform/resolvers/zod';
import { IconChevronLeft } from '@tabler/icons-react';
import { Button, cn, Form, Label } from 'erxes-ui';
import { useState } from 'react';
import { useForm, UseFormReturn, UseFormSetValue } from 'react-hook-form';
import {
  AutomationTriggerFormProps,
  generateAutomationElementId,
} from 'ui-modules';
import { FacebookBotSelector } from '../../MessengerBotSelector';
import {
  TMessageTriggerForm,
  TMessageTriggerFormDirectMessage,
  TMessageTriggerFormPersistentMenu,
  triggerFormSchema,
} from '../states/messageTriggerFormSchema';
import { DirectMessageConfigForm } from './DirectMessageConfigForm';
import { FacebookBotPersistenceMenuSelector } from './FacebookBotPersistenceMenuSelector';
import { MessageTriggerConditionsList } from './MessageTriggerConditionsList';

const renderActiveItemContent = ({
  onConditionChange,
  activeItemType,
  setActiveItemType,
  formState,
}: {
  onConditionChange: (
    conditionType: string,
    fieldName: 'persistentMenuIds' | 'conditions' | 'isSelected',
    fieldValue:
      | TMessageTriggerFormDirectMessage
      | TMessageTriggerFormPersistentMenu
      | boolean,
  ) => void;
  activeItemType: string;
  setActiveItemType: React.Dispatch<React.SetStateAction<string>>;
  formState: TMessageTriggerForm;
  setFormValue: UseFormSetValue<TMessageTriggerForm>;
}) => {
  const onConditionItemChange = (
    fieldName: 'persistentMenuIds' | 'conditions',
    fieldValue:
      | TMessageTriggerFormDirectMessage
      | TMessageTriggerFormPersistentMenu,
  ) => {
    onConditionChange(activeItemType, fieldName, fieldValue);
  };

  const currentCondition = formState.conditions?.find(
    ({ type }) => type === activeItemType,
  );

  return (
    <div className="border border-md m-4 py-2 px-4">
      <Button variant="ghost" onClick={() => setActiveItemType('')}>
        <IconChevronLeft />
        Back to conditions
      </Button>
      {(() => {
        switch (activeItemType) {
          case 'direct':
            return (
              <DirectMessageConfigForm
                conditions={currentCondition?.conditions || []}
                onConditionChange={onConditionItemChange}
              />
            );
          case 'persistentMenu':
            return (
              <FacebookBotPersistenceMenuSelector
                botId={formState.botId}
                selectedPersistentMenuIds={currentCondition?.persistentMenuIds}
                onConditionChange={onConditionItemChange}
              />
            );
          default:
            return null;
        }
      })()}
    </div>
  );
};

const renderConditionsContent = ({
  activeItemType,
  setActiveItemType,
  formState,
  setFormValue,
  form,
}: {
  activeItemType: string;
  setActiveItemType: React.Dispatch<React.SetStateAction<string>>;
  formState: TMessageTriggerForm;
  setFormValue: UseFormSetValue<TMessageTriggerForm>;
  form: UseFormReturn<TMessageTriggerForm>;
}) => {
  const onConditionChange = (
    conditionType: string,
    fieldName: 'persistentMenuIds' | 'conditions' | 'isSelected',
    fieldValue:
      | TMessageTriggerFormDirectMessage
      | TMessageTriggerFormPersistentMenu
      | boolean,
  ) => {
    const condition = (formState?.conditions || []).find(
      ({ type }) => type === conditionType,
    );

    if (!condition) {
      setFormValue('conditions', [
        ...(formState?.conditions || []),
        {
          _id: generateAutomationElementId(),
          type: conditionType,
          [fieldName]: fieldValue,
        },
      ]);
    } else {
      setFormValue('conditions', [
        ...(formState?.conditions || []).map((cond) =>
          cond.type === conditionType
            ? { ...cond, [fieldName]: fieldValue }
            : cond,
        ),
      ]);
    }
  };

  if (activeItemType) {
    return renderActiveItemContent({
      onConditionChange,
      activeItemType,
      setActiveItemType,
      formState,
      setFormValue,
    });
  }

  const onItemCheck = (type: string, isChecked: boolean) => {
    onConditionChange(type, 'isSelected', isChecked);
  };

  return (
    <MessageTriggerConditionsList
      form={form}
      setActiveItemType={setActiveItemType}
      onItemCheck={onItemCheck}
      selectedConditionTypes={(formState?.conditions || [])
        .filter(({ isSelected }) => isSelected)
        .map(({ type }) => type)}
    />
  );
};

export const MessageTriggerForm = ({
  activeTrigger,
  onSaveTriggerConfig,
}: AutomationTriggerFormProps<TMessageTriggerForm>) => {
  const form = useForm<TMessageTriggerForm>({
    resolver: zodResolver(triggerFormSchema),
    values: { ...((activeTrigger?.config || {}) as TMessageTriggerForm) },
  });
  const { watch, setValue, handleSubmit } = form;
  const formState = watch();
  const [activeItemType, setActiveItemType] = useState('');

  return (
    <Form {...form}>
      <div className="flex flex-col h-full">
        <Form.Field
          control={form.control}
          name="botId"
          render={({ field }) => (
            <FacebookBotSelector
              botId={field.value}
              onSelect={field.onChange}
            />
          )}
        />

        <Label className="ml-4 mt-2">Triggers</Label>
        <div
          className={cn('flex-1 flex flex-col relative', {
            blur: !formState.botId,
          })}
        >
          <div className="flex-1 overflow-auto">
            {renderConditionsContent({
              activeItemType,
              setActiveItemType,
              formState,
              setFormValue: setValue,
              form,
            })}
          </div>

          <div className="p-2 flex justify-end border-t bg-white">
            <Button onClick={handleSubmit(onSaveTriggerConfig)}>Save</Button>
          </div>
        </div>
      </div>
    </Form>
  );
};
