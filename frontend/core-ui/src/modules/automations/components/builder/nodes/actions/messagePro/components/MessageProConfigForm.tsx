import { AutomationConfigFormWrapper } from '@/automations/components/builder/nodes/components/AutomationConfigFormWrapper';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from 'erxes-ui';
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
  const form = useForm<TMessageProConfigForm>({
    resolver: zodResolver(messageProConfigFormSchema),
    defaultValues: {
      documentId: currentAction?.config?.documentId || '',
    },
  });
  const { control, handleSubmit } = form;

  return (
    <FormProvider {...form}>
      <AutomationConfigFormWrapper onSave={handleSubmit(handleSave)}>
        <Form.Field
          control={control}
          name="documentId"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Document</Form.Label>
              <SelectDocument.FormItem
                mode="single"
                value={field.value}
                onValueChange={(value) => field.onChange(value as string)}
                placeholder="Select a document"
              />
              <Form.Description className="text-xs">
                The selected document is rendered with the trigger/target record
                and exposed as this action&apos;s output.
              </Form.Description>
              <Form.Message />
            </Form.Item>
          )}
        />
      </AutomationConfigFormWrapper>
    </FormProvider>
  );
};
