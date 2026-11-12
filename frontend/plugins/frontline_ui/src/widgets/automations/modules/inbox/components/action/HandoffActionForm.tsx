import { zodResolver } from '@hookform/resolvers/zod';
import { Form, Input } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  AutomationActionFormProps,
  PlaceholderInput,
  TPlaceholderInputSuggestion,
  useAutomationRemoteFormSubmit,
  useFormValidationErrorHandler,
} from 'ui-modules';
import {
  handoffActionFormSchema,
  THandoffActionForm,
} from '../../states/handoffActionForm';

export const HandoffActionForm = ({
  formRef,
  currentAction,
  onSaveActionConfig,
  targetType,
}: AutomationActionFormProps<THandoffActionForm>) => {
  const { t } = useTranslation('frontline');
  const form = useForm<THandoffActionForm>({
    resolver: zodResolver(handoffActionFormSchema),
    defaultValues: {
      ...(currentAction?.config || {}),
      pauseMinutes:
        currentAction?.config?.pauseMinutes !== undefined
          ? String(currentAction.config.pauseMinutes)
          : '',
    },
  });
  const { control, handleSubmit } = form;
  const { handleValidationErrors } = useFormValidationErrorHandler({
    formName: t('handoff-action-form-name', 'Hand off to a person'),
  });

  useAutomationRemoteFormSubmit({
    formRef,
    callback: () => {
      handleSubmit(onSaveActionConfig, handleValidationErrors)();
    },
  });

  return (
    <Form {...form}>
      <div className="flex flex-col gap-4">
        <Form.Field
          control={control}
          name="assignTo"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('assign-to')}</Form.Label>
              <PlaceholderInput
                propertyType={targetType}
                value={field.value || ''}
                onChange={field.onChange}
                placeholderConfig={{
                  selectMode: 'many',
                  delimiter: ',',
                  allowOnlyTriggers: true,
                }}
                enabled={[TPlaceholderInputSuggestion.CallUser]}
              />
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          control={control}
          name="pauseMinutes"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('pause-time')}</Form.Label>
              <Form.Control>
                <Input
                  type="number"
                  min={1}
                  placeholder="30"
                  value={field.value || ''}
                  onChange={field.onChange}
                />
              </Form.Control>
              <Form.Description>
                {t(
                  'handoff-pause-description',
                  'Minutes the bot stays quiet on this conversation. 30 when empty.',
                )}
              </Form.Description>
              <Form.Message />
            </Form.Item>
          )}
        />
      </div>
    </Form>
  );
};
