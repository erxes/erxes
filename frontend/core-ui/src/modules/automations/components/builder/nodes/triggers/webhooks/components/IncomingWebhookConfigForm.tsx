import { IncomingWebhookBodyField } from '@/automations/components/builder/nodes/triggers/webhooks/components/IncomingWebhookBodyField';
import { IncomingWebhookEndpointField } from '@/automations/components/builder/nodes/triggers/webhooks/components/IncomingWebhookEndpointField';
import { IncomingWebhookHeadersBuilder } from '@/automations/components/builder/nodes/triggers/webhooks/components/IncomingWebhookHeaderBuilder';
import { IncomingWebhookSettingsField } from '@/automations/components/builder/nodes/triggers/webhooks/components/IncomingWebhookSettingsField';
import { AUTOMATION_INCOMING_WEBHOOK_API_METHODS } from '@/automations/components/builder/nodes/triggers/webhooks/constants/incomingWebhook';
import {
  incomingWebhookFormSchema,
  TIncomingWebhookForm,
} from '@/automations/components/builder/nodes/triggers/webhooks/states/automationIncomingWebhookFormDefinition';
import { AutomationTriggerSidebarCoreFormProps } from '@/automations/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, Select, Tabs, toast } from 'erxes-ui';
import { useImperativeHandle } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

export const IncomingWebhookConfigForm = ({
  formRef,
  handleSave,
  activeNode,
}: AutomationTriggerSidebarCoreFormProps) => {
  const form = useForm<TIncomingWebhookForm>({
    resolver: zodResolver(incomingWebhookFormSchema),
    defaultValues: {
      ...(activeNode?.config || {}),
    },
  });

  useImperativeHandle(formRef, () => ({
    submit: () =>
      form.handleSubmit(handleSave, (error) => {
        toast({
          title: 'There is some error in the form',
          variant: 'destructive',
        });
      })(),
  }));

  return (
    <FormProvider {...form}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-row items-end gap-2">
          <Form.Field
            control={form.control}
            name="method"
            defaultValue={AUTOMATION_INCOMING_WEBHOOK_API_METHODS[1]}
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Method</Form.Label>
                <Select value={field.value} onValueChange={field.onChange}>
                  <Select.Trigger>
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Content>
                    {AUTOMATION_INCOMING_WEBHOOK_API_METHODS.map((method) => {
                      return (
                        <Select.Item key={method} value={method}>
                          {method}
                        </Select.Item>
                      );
                    })}
                  </Select.Content>
                </Select>
              </Form.Item>
            )}
          />

          <Form.Field
            control={form.control}
            name="endpoint"
            render={({ field }) => (
              <IncomingWebhookEndpointField field={field} />
            )}
          />
        </div>
        <Tabs defaultValue="headers">
          <Tabs.List>
            <Tabs.Trigger value="headers">Headers</Tabs.Trigger>
            <Tabs.Trigger value="body">Body</Tabs.Trigger>
            <Tabs.Trigger value="settings">Settings</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="headers" className="py-4">
            <Form.Field
              control={form.control}
              name="headers"
              render={({ field }) => (
                <Form.Item>
                  <IncomingWebhookHeadersBuilder
                    headers={field.value}
                    onChange={field.onChange}
                  />
                </Form.Item>
              )}
            />
          </Tabs.Content>
          <Tabs.Content value="body" className="py-4">
            <Form.Field
              control={form.control}
              name="schema"
              render={({ field }) => <IncomingWebhookBodyField field={field} />}
            />
          </Tabs.Content>
          <Tabs.Content value="settings" className="py-4 px-2">
            <IncomingWebhookSettingsField form={form} />
          </Tabs.Content>
        </Tabs>
      </div>
    </FormProvider>
  );
};
