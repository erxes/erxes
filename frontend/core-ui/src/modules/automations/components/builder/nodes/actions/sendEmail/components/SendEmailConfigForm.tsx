import { SendEmailConfigFormRow } from '@/automations/components/builder/nodes/actions/sendEmail/components/SendEmailConfigFormRow';
import { SendEmailCustomMailsInput } from '@/automations/components/builder/nodes/actions/sendEmail/components/SendEmailCustomMailsInput';
import { useSendEmailSidebarForm } from '@/automations/components/builder/nodes/actions/sendEmail/hooks/useSendEmailSidebarForm';
import { TAutomationSendEmailConfig } from '@/automations/components/builder/nodes/actions/sendEmail/states/sendEmailConfigForm';
import { AutomationCoreConfigFormWrapper } from '@/automations/components/builder/nodes/components/AutomationConfigFormWrapper';
import { useFormValidationErrorHandler } from '@/automations/hooks/useFormValidationErrorHandler';
import { Form, Label, RadioGroup, Tabs } from 'erxes-ui';
import { FormProvider } from 'react-hook-form';
import {
  PlaceHolderInput,
  SelectCustomer,
  SelectMember,
  TAutomationActionProps,
} from 'ui-modules';
import { SendEmailEmailContentBuilder } from './SendEmailEmailContentBuilder';

export const SendEmailConfigForm = ({
  currentActionIndex,
  handleSave,
}: TAutomationActionProps<TAutomationSendEmailConfig>) => {
  const { handleValidationErrors } = useFormValidationErrorHandler({
    formName: 'Send email Configuration',
  });
  const { form, contentType } = useSendEmailSidebarForm(currentActionIndex);

  const config = form.getValues();

  return (
    <FormProvider {...form}>
      <AutomationCoreConfigFormWrapper
        onSave={form.handleSubmit(handleSave, handleValidationErrors)}
      >
        <SendEmailConfigFormRow
          title="Sender"
          subContent="Who is sending email"
          isDone={!!config?.fromUserId}
        >
          <Form.Field
            name="type"
            control={form.control}
            render={({ field }) => (
              <RadioGroup
                value={field.value}
                onValueChange={(value) => field.onChange(value)}
              >
                <label className="flex space-x-2 items-center">
                  <RadioGroup.Item value="default" id="env-sender" />
                  <Label htmlFor="env-sender">Use company email</Label>
                </label>
                <label className="flex space-x-2 items-center">
                  <RadioGroup.Item value="custom" id="custom-sender" />
                  <Label htmlFor="custom-sender">Custom sender email</Label>
                </label>
              </RadioGroup>
            )}
          />
          <Form.Field
            name="fromEmailPlaceHolder"
            control={form.control}
            render={({ field }) => (
              <Form.Item className="py-4">
                <PlaceHolderInput
                  onlySet
                  propertyType={contentType || ''}
                  {...field}
                />
              </Form.Item>
            )}
          />
        </SendEmailConfigFormRow>

        <SendEmailConfigFormRow
          title="Recipient"
          subContent="Who is recipients"
          isDone={!!config!!?.attributionMails}
        >
          <Form.Field
            name="attributionMails"
            control={form.control}
            render={({ field }) => (
              <Form.Item>
                <PlaceHolderInput propertyType={contentType || ''} {...field} />
              </Form.Item>
            )}
          />
        </SendEmailConfigFormRow>

        <SendEmailConfigFormRow
          title="Subject"
          subContent="Configure the subject of the email"
          isDone={!!config?.subject}
        >
          <Form.Field
            name="subject"
            control={form.control}
            render={({ field }) => (
              <Form.Item className="py-4">
                <PlaceHolderInput propertyType={contentType || ''} {...field} />
              </Form.Item>
            )}
          />
        </SendEmailConfigFormRow>

        <SendEmailConfigFormRow
          title="Email Content"
          subContent="Select a template or create custom content"
          isDone={!!config?.content}
        >
          <Form.Field
            name="content"
            control={form.control}
            render={({ field }) => (
              <Form.Item>
                <SendEmailEmailContentBuilder
                  content={field.value || ''}
                  onChange={field.onChange}
                />
              </Form.Item>
            )}
          />
        </SendEmailConfigFormRow>
      </AutomationCoreConfigFormWrapper>
    </FormProvider>
  );
};
