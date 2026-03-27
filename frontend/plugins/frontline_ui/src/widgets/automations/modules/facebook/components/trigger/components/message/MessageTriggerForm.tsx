import { FormProvider } from 'react-hook-form';
import { Form, Label, cn } from 'erxes-ui';
import { AutomationTriggerFormProps } from 'ui-modules';
import { FacebookBotSelector } from '../../../MessengerBotSelector';
import { MessageTriggerFormProvider } from '../../context/MessageTriggerFormContext';
import { useMessageTriggerForm } from '../../hooks/useMessageTriggerForm';
import { TMessageTriggerForm } from '../../types/messageTrigger';
import { MessageTriggerConditionsList } from './MessageTriggerConditionsList';
import { MessageTriggerConfigPanel } from './MessageTriggerConfigPanel';

export const MessageTriggerForm = ({
  activeTrigger,
  onSaveTriggerConfig,
  formRef,
}: AutomationTriggerFormProps<TMessageTriggerForm>) => {
  const { form, botId, activeConditionType, setActiveConditionType } =
    useMessageTriggerForm({
      activeTrigger,
      onSaveTriggerConfig,
      formRef,
    });

  return (
    <MessageTriggerFormProvider
      value={{ activeConditionType, setActiveConditionType }}
    >
      <FormProvider {...form}>
        <div className="flex h-full flex-col">
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

          <div className={cn('relative flex flex-1 flex-col', { blur: !botId })}>
            {!activeConditionType ? <MessageTriggerConditionsList /> : null}
            <MessageTriggerConfigPanel />
          </div>
        </div>
      </FormProvider>
    </MessageTriggerFormProvider>
  );
};
