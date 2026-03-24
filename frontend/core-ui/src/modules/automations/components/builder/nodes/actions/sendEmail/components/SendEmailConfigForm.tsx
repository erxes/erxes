import { useSendEmailSidebarForm } from '@/automations/components/builder/nodes/actions/sendEmail/hooks/useSendEmailSidebarForm';
import { TAutomationSendEmailConfig } from '@/automations/components/builder/nodes/actions/sendEmail/states/sendEmailConfigForm';
import { AutomationConfigFormWrapper } from '@/automations/components/builder/nodes/components/AutomationConfigFormWrapper';
import { Collapsible, Form, Label, RadioGroup, Separator } from 'erxes-ui';
import { FormProvider } from 'react-hook-form';
import { PlaceholderInput, TAutomationActionProps, useFormValidationErrorHandler } from 'ui-modules';
import { SendEmailEmailContentBuilder } from './SendEmailEmailContentBuilder';

export const SendEmailConfigForm = ({
  currentActionIndex,
  currentAction,
  handleSave,
}: TAutomationActionProps<TAutomationSendEmailConfig>) => {
  const { handleValidationErrors } = useFormValidationErrorHandler({
    formName: 'Send email Configuration',
  });
  const { form, contentType } = useSendEmailSidebarForm(
    currentActionIndex,
    currentAction,
  );
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
                          call_user: true,
                        }}
                        suggestionsOptions={{
                          call_user: {
                            selectFieldName: 'email',
                            formatSelection: (value) => value,
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

        <Collapsible>
          <Form.Field
            name="toEmailsPlaceHolders"
            control={form.control}
            render={({ field }) => (
              <Form.Item>
                <Form.Label className="flex justify-between">
                  <div>
                    To<span className="text-destructive">*</span>
                  </div>
                  <Collapsible.Trigger className="group">
                    <Form.Label className="group-data-[state=open]:text-destructive cursor-pointer pb-2">
                      CC
                    </Form.Label>
                  </Collapsible.Trigger>
                </Form.Label>
                <PlaceholderInput
                  propertyType={contentType || ''}
                  {...field}
                  enabled={{
                    attribute: true,
                    call_user: true,
                  }}
                  suggestionsOptions={{
                    call_user: {
                      selectFieldName: 'email',
                      formatSelection: (value) => value,
                    },
                  }}
                />
              </Form.Item>
            )}
          />
          <Collapsible.Content className="pt-2">
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
                      call_user: true,
                    }}
                    suggestionsOptions={{
                      call_user: {
                        selectFieldName: 'email',
                        formatSelection: (value) => value,
                      },
                    }}
                  />
                </Form.Item>
              )}
            />
          </Collapsible.Content>
        </Collapsible>
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
                contentType={contentType}
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
