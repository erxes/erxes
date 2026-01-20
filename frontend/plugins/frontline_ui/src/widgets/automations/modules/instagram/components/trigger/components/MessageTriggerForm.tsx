import { zodResolver } from '@hookform/resolvers/zod';
import { IconChevronLeft } from '@tabler/icons-react';
import { Button, cn, Form, Label, toast } from 'erxes-ui';
import { useState } from 'react';
import {
  FormProvider,
  useForm,
  UseFormReturn,
  UseFormSetValue,
} from 'react-hook-form';
import {
  AutomationTriggerFormProps,
  generateAutomationElementId,
  useAutomationRemoteFormSubmit,
} from 'ui-modules';
import { InstagramBotSelector } from '../../MessengerBotSelector';
import {
  TMessageTriggerForm,
  TMessageTriggerFormDirectMessage,
  TMessageTriggerFormPersistentMenu,
  triggerFormSchema,
} from '../states/messageTriggerFormSchema';
import { DirectMessageConfigForm } from './DirectMessageConfigForm';
import { InstagramBotPersistenceMenuSelector } from './InstagramBotPersistenceMenuSelector';
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
              <InstagramBotPersistenceMenuSelector
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
}: {
  activeItemType: string;
  setActiveItemType: React.Dispatch<React.SetStateAction<string>>;
  formState: TMessageTriggerForm;
  setFormValue: UseFormSetValue<TMessageTriggerForm>;
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
  formRef,
}: AutomationTriggerFormProps<TMessageTriggerForm>) => {
  const form = useForm<TMessageTriggerForm>({
    resolver: zodResolver(triggerFormSchema),
    values: { ...((activeTrigger?.config || {}) as TMessageTriggerForm) },
  });
  const { watch, setValue, handleSubmit } = form;
  const formState = watch();
  const [activeItemType, setActiveItemType] = useState('');
  useAutomationRemoteFormSubmit({
    formRef: formRef,
    callback: () => {
      handleSubmit(onSaveTriggerConfig, () =>
        toast({
          title: 'There is some error in the form',
          variant: 'destructive',
        }),
      )();
    },
  });

  return (
    <FormProvider {...form}>
      <div className="flex flex-col h-full">
        <Form.Field
          control={form.control}
          name="botId"
          render={({ field }) => (
            <InstagramBotSelector
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
          {renderConditionsContent({
            activeItemType,
            setActiveItemType,
            formState,
            setFormValue: setValue,
          })}
        </div>
      </div>
    </FormProvider>
  );
};
