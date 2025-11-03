import { useSendEmailSidebarForm } from '@/automations/components/builder/nodes/actions/sendEmail/hooks/useSendEmailSidebarForm';
import { TAutomationSendEmailConfig } from '@/automations/components/builder/nodes/actions/sendEmail/states/sendEmailConfigForm';
import { AutomationConfigFormWrapper } from '@/automations/components/builder/nodes/components/AutomationConfigFormWrapper';
import { useFormValidationErrorHandler } from '@/automations/hooks/useFormValidationErrorHandler';
import { Collapsible, Form, Label, RadioGroup, Separator } from 'erxes-ui';
import { FormProvider } from 'react-hook-form';
import { PlaceholderInput, TAutomationActionProps } from 'ui-modules';
import { SendEmailEmailContentBuilder } from './SendEmailEmailContentBuilder';

export const SendEmailConfigForm = ({
  currentActionIndex,
  handleSave,
}: TAutomationActionProps<TAutomationSendEmailConfig>) => {
  const { handleValidationErrors } = useFormValidationErrorHandler({
    formName: 'Send email Configuration',
  });
  const { form, contentType } = useSendEmailSidebarForm(currentActionIndex);

  return (
    <FormProvider {...form}>
      <AutomationConfigFormWrapper
        onSave={form.handleSubmit(handleSave, handleValidationErrors)}
      >
        <Form.Field
          name="type"
          control={form.control}
          render={({ field }) => (
            <Form.Item>
              <Form.Label>
                Sender<span className="text-destructive">*</span>
              </Form.Label>
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
            </Form.Item>
          )}
        />
        <Form.Field
          name="type"
          control={form.control}
          render={({ field }) => {
            if (field.value === 'custom') {
              return (
                <Form.Field
                  name="fromEmailPlaceHolder"
                  control={form.control}
                  render={({ field }) => (
                    <Form.Item className="py-4">
                      <PlaceholderInput
                        propertyType={contentType || ''}
                        {...field}
                        enabled={{
                          attribute: true,
                          call_user: {
                            enabled: true,
                            selectFieldName: 'email',
                          },
                        }}
                      />
                    </Form.Item>
                  )}
                />
              );
            }

            return <></>;
          }}
        />

        <Separator className="space-y-2" />

        <Form.Field
          name="toEmailsPlaceHolders"
          control={form.control}
          render={({ field }) => (
            <Form.Item>
              <Form.Label>
                To<span className="text-destructive">*</span>
              </Form.Label>
              <PlaceholderInput
                propertyType={contentType || ''}
                {...field}
                enabled={{
                  attribute: true,
                  call_user: {
                    enabled: true,
                    selectFieldName: 'email',
                  },
                }}
              />
              <Collapsible>
                <Collapsible.Trigger className="group">
                  <Form.Label className="group-data-[state=open]:text-destructive cursor-pointer pb-2">
                    CC
                  </Form.Label>
                </Collapsible.Trigger>
                <Collapsible.Content>
                  <Form.Field
                    name="ccEmailsPlaceHolders"
                    control={form.control}
                    render={({ field }) => (
                      <Form.Item>
                        <PlaceholderInput
                          propertyType={contentType || ''}
                          {...field}
                          enabled={{
                            attribute: true,
                            call_user: {
                              enabled: true,
                              selectFieldName: 'email',
                            },
                          }}
                        />
                      </Form.Item>
                    )}
                  />
                </Collapsible.Content>
              </Collapsible>
            </Form.Item>
          )}
        />
        <Separator className="space-y-2" />
        <Form.Field
          name="subject"
          control={form.control}
          render={({ field }) => (
            <Form.Item>
              <Form.Label>
                Subject<span className="text-destructive">*</span>
              </Form.Label>
              <PlaceholderInput propertyType={contentType || ''} {...field} />
            </Form.Item>
          )}
        />
        <Separator className="space-y-2" />
        <Form.Field
          name="content"
          control={form.control}
          render={({ field }) => (
            <Form.Item>
              <Form.Label>
                Email Content<span className="text-destructive">*</span>
              </Form.Label>
              <SendEmailEmailContentBuilder
                content={field.value || ''}
                onChange={field.onChange}
              />
            </Form.Item>
          )}
        />
      </AutomationConfigFormWrapper>
    </FormProvider>
  );
};
