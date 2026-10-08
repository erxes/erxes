import { useTranslation } from 'react-i18next';
import { AutomationConfigFormWrapper } from '@/automations/components/builder/nodes/components/AutomationConfigFormWrapper';
import { useDocumentsTypes } from '@/documents/hooks/useDocumentsTypes';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, Select } from 'erxes-ui';
import { FormProvider, useForm } from 'react-hook-form';
import { SelectDocument, TAutomationActionProps } from 'ui-modules';
import {
  messageProConfigFormSchema,
  TMessageProConfigForm,
} from '../states/messageProConfigForm';

export const MessageProConfigForm = ({
  handleSave,
  currentAction,
}: TAutomationActionProps<TMessageProConfigForm>) => {
  const { t } = useTranslation('automations');
  const { documentsTypes } = useDocumentsTypes();
  const form = useForm<TMessageProConfigForm>({
    resolver: zodResolver(messageProConfigFormSchema),
    defaultValues: {
      contentType: currentAction?.config?.contentType || '',
      documentId: currentAction?.config?.documentId || '',
    },
  });
  const { control, handleSubmit, watch, setValue } = form;
  const contentType = watch('contentType');

  return (
    <FormProvider {...form}>
      <AutomationConfigFormWrapper onSave={handleSubmit(handleSave)}>
        <Form.Field
          control={control}
          name="contentType"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('message-pro-document-type')}</Form.Label>
              <Select
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value);
                  setValue('documentId', '');
                }}
              >
                <Select.Trigger className="h-9">
                  <Select.Value
                    placeholder={t('message-pro-select-document-type')}
                  />
                </Select.Trigger>
                <Select.Content>
                  {documentsTypes.map(({ contentType, label }) => (
                    <Select.Item key={contentType} value={contentType}>
                      {label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
              <Form.Description className="text-xs">
                {t('message-pro-document-type-description')}
              </Form.Description>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          control={control}
          name="documentId"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('message-pro-document')}</Form.Label>
              <SelectDocument.FormItem
                mode="single"
                value={field.value}
                onValueChange={(value) => field.onChange(value as string)}
                placeholder={t('message-pro-select-document')}
                contentType={contentType}
              />
              <Form.Description className="text-xs">
                {t('message-pro-document-description')}
              </Form.Description>
              <Form.Message />
            </Form.Item>
          )}
        />
      </AutomationConfigFormWrapper>
    </FormProvider>
  );
};
