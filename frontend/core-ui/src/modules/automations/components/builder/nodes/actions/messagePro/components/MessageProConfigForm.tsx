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
import { useTranslation } from 'react-i18next';

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
              <Form.Label>{t('document-type', 'Document type')}</Form.Label>
              <Select
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value);
                  setValue('documentId', '');
                }}
              >
                <Select.Trigger className="h-9">
                  <Select.Value placeholder={t('select-a-document-type', 'Select a document type')} />
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
                {t('document-type-description', 'Narrows the document list below to documents of this type.')}
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
              <Form.Label>{t('document', 'Document')}</Form.Label>
              <SelectDocument.FormItem
                mode="single"
                value={field.value}
                onValueChange={(value) => field.onChange(value as string)}
                placeholder={t('select-a-document', 'Select a document')}
                contentType={contentType}
              />
              <Form.Description className="text-xs">
                {t('document-render-description', 'The selected document is rendered with the trigger/target record and exposed as this action\'s output.')}
              </Form.Description>
              <Form.Message />
            </Form.Item>
          )}
        />
      </AutomationConfigFormWrapper>
    </FormProvider>
  );
};
