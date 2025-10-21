import { SendEmailConfigFormRow } from '@/automations/components/builder/nodes/actions/sendEmail/components/SendEmailConfigFormRow';
import { SendEmailCustomMailsInput } from '@/automations/components/builder/nodes/actions/sendEmail/components/SendEmailCustomMailsInput';
import { useSendEmailSidebarForm } from '@/automations/components/builder/nodes/actions/sendEmail/hooks/useSendEmailSidebarForm';
import { TAutomationSendEmailConfig } from '@/automations/components/builder/nodes/actions/sendEmail/types/automationSendEmail';
import { Card, Form, Label, RadioGroup, Tabs } from 'erxes-ui';
import {
  PlaceHolderInput,
  SelectCustomer,
  SelectMember,
  TAutomationActionProps,
} from 'ui-modules';

const SendEmailConfigurationForm = ({
  currentActionIndex,
}: {
  currentActionIndex: number;
}) => {
  const { config, control, contentType } =
    useSendEmailSidebarForm(currentActionIndex);

  return (
    <Card.Content className="space-y-2 max-w-xl pt-6">
      <SendEmailConfigFormRow
        title="Sender"
        subContent="Who is sending email"
        isDone={!!config?.fromUserId}
      >
        <Form.Field
          name={`actions.${currentActionIndex}.config.type`}
          control={control}
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
        {config.type === 'custom' && (
          <Tabs>
            <Tabs.List defaultValue="default">
              <Tabs.Trigger value="default" className="w-1/2">
                Placeholder input
              </Tabs.Trigger>
              <Tabs.Trigger value="custom" className="w-1/2">
                Select team member
              </Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="default">
              <Form.Field
                name={`actions.${currentActionIndex}.config.fromEmailPlaceHolder`}
                control={control}
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
            </Tabs.Content>
            <Tabs.Content value="custom">
              <Form.Field
                name={`actions.${currentActionIndex}.config.fromUserId`}
                control={control}
                render={({ field }) => (
                  <Form.Item className="py-4">
                    <SelectMember.FormItem
                      value={field.value}
                      onValueChange={field.onChange}
                    />
                  </Form.Item>
                )}
              />
            </Tabs.Content>
          </Tabs>
        )}
      </SendEmailConfigFormRow>

      <SendEmailConfigFormRow
        title="Recipient"
        subContent="Who is recipients"
        isDone={[
          'attributionMails',
          'customMails',
          'customer',
          'teamMember',
        ].some((key) => (config || {})[key])}
      >
        <Tabs defaultValue="dynamic" className="w-full">
          <Tabs.List className="grid w-full grid-cols-2">
            <Tabs.Trigger
              value="dynamic"
              className="flex items-center space-x-2"
            >
              <span>From Target</span>
              {config?.attributionMails && (
                <div className="ml-2 size-1 bg-primary rounded-full" />
              )}
            </Tabs.Trigger>
            <Tabs.Trigger
              value="static"
              className="flex items-center space-x-2"
            >
              <span>Fixed Recipients</span>
              {(config?.customMails ||
                config?.customer ||
                config?.teamMember) && (
                <div className="ml-2 size-1 bg-primary rounded-full" />
              )}
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="dynamic" className="p-4">
            <Form.Field
              name={`actions.${currentActionIndex}.config.attributionMails`}
              control={control}
              render={({ field }) => (
                <Form.Item>
                  <PlaceHolderInput
                    propertyType={contentType || ''}
                    {...field}
                  />
                </Form.Item>
              )}
            />
          </Tabs.Content>

          <Tabs.Content value="static" className="space-y-4 p-4">
            <SendEmailCustomMailsInput
              currentActionIndex={currentActionIndex}
            />

            <Form.Field
              name={`actions.${currentActionIndex}.config.teamMember`}
              control={control}
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Team members</Form.Label>
                  <SelectMember.FormItem
                    value={field.value}
                    onValueChange={field.onChange}
                  />
                </Form.Item>
              )}
            />

            <Form.Field
              name={`actions.${currentActionIndex}.config.customer`}
              control={control}
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Customers</Form.Label>
                  <SelectCustomer.FormItem
                    mode="multiple"
                    value={field.value}
                    onValueChange={field.onChange}
                  />
                </Form.Item>
              )}
            />
          </Tabs.Content>
        </Tabs>
      </SendEmailConfigFormRow>

      <SendEmailConfigFormRow
        title="Subject"
        subContent="Configure the subject of the email"
        isDone={!!config?.subject}
      >
        <Form.Field
          name={`actions.${currentActionIndex}.config.subject`}
          control={control}
          render={({ field }) => (
            <Form.Item className="py-4">
              <PlaceHolderInput propertyType={contentType || ''} {...field} />
            </Form.Item>
          )}
        />
      </SendEmailConfigFormRow>

      <SendEmailConfigFormRow title="Selected Email Template">
        <div className="p-4 text-center text-muted-foreground">
          Email template selection will be implemented here
        </div>
      </SendEmailConfigFormRow>
    </Card.Content>
  );
};
export const SendEmailConfigForm = ({
  currentActionIndex,
}: TAutomationActionProps<TAutomationSendEmailConfig>) => {
  return <SendEmailConfigurationForm currentActionIndex={currentActionIndex} />;
};
