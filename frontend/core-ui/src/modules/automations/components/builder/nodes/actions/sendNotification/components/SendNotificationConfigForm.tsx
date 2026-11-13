import { AutomationConfigFormWrapper } from '@/automations/components/builder/nodes/components/AutomationConfigFormWrapper';
import { Form, Select } from 'erxes-ui';
import { FormProvider } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  PlaceholderInput,
  TAutomationActionProps,
  TPlaceholderInputSuggestion,
} from 'ui-modules';
import { useSendNotificationForm } from '../hooks/useSendNotificationForm';
import {
  NOTIFICATION_PRIORITIES,
  TSendNotificationConfigForm,
} from '../states/sendNotificationConfigForm';

export const SendNotificationConfigForm = ({
  handleSave,
  currentAction,
}: TAutomationActionProps<TSendNotificationConfigForm>) => {
  const { t } = useTranslation('automations');
  const { form, propertyType } = useSendNotificationForm(currentAction);
  const { control, handleSubmit } = form;

  return (
    <FormProvider {...form}>
      <AutomationConfigFormWrapper onSave={handleSubmit(handleSave)}>
        <Form.Field
          control={control}
          name="userIds"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('notification-recipients', 'Team members')}</Form.Label>
              <PlaceholderInput
                propertyType={propertyType}
                value={field.value || ''}
                onChange={field.onChange}
                placeholderConfig={{
                  selectMode: 'many',
                  delimiter: ',',
                  allowOnlyTriggers: true,
                }}
                enabled={[TPlaceholderInputSuggestion.CallUser]}
              />
              <Form.Description className="text-xs">
                {t(
                  'notification-sender-description',
                  'Sent in the name of the automation owner. Transfer ownership to change who it comes from.',
                )}
              </Form.Description>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          control={control}
          name="title"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('notification-title', 'Title')}</Form.Label>
              <PlaceholderInput
                propertyType={propertyType}
                value={field.value || ''}
                onChange={field.onChange}
              />
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          control={control}
          name="message"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('notification-message', 'Message')}</Form.Label>
              <PlaceholderInput
                propertyType={propertyType}
                value={field.value || ''}
                onChange={field.onChange}
                variant="expression"
              >
                <PlaceholderInput.Header />
              </PlaceholderInput>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          control={control}
          name="priority"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('notification-priority', 'Priority')}</Form.Label>
              <Select value={field.value || 'medium'} onValueChange={field.onChange}>
                <Select.Trigger className="h-9">
                  <Select.Value />
                </Select.Trigger>
                <Select.Content>
                  {NOTIFICATION_PRIORITIES.map((priority) => (
                    <Select.Item key={priority} value={priority}>
                      {t(`notification-priority-${priority}`, priority)}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
              <Form.Message />
            </Form.Item>
          )}
        />
      </AutomationConfigFormWrapper>
    </FormProvider>
  );
};
