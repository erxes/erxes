import { IncomingWebhookHeadersBuilder } from '@/automations/components/builder/nodes/triggers/webhooks/components/IncomingWebhookHeaderBuilder';
import { IncomingWebhookPayloadSchemaSheet } from '@/automations/components/builder/nodes/triggers/webhooks/components/IncomingWebhookPayloadSchemaSheet';
import { generateSchemaPreview } from '@/automations/components/builder/nodes/triggers/webhooks/utils/incomingWebhookJsonBuilder';
import { AUTOMATION_INCOMING_WEBHOOK_API_METHODS } from '@/automations/components/builder/nodes/triggers/webhooks/constants/incomingWebhook';
import { useAutomationWebhookEndpoint } from '@/automations/components/builder/nodes/triggers/webhooks/hooks/useAutomationWebhookEndpoint';
import {
  incomingWebhookFormSchema,
  TIncomingWebhookForm,
} from '@/automations/components/builder/nodes/triggers/webhooks/states/automationIncomingWebhookFormDefinition';
import { AutomationTriggerSidebarCoreFormProps } from '@/automations/types';
import { copyText } from '@/automations/utils/automationBuilderUtils/triggerUtils';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconCopy } from '@tabler/icons-react';
import { Button, Form, Input, Select, Tabs, toast } from 'erxes-ui';
import { useImperativeHandle, useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

export const IncomingWebhookConfigForm = ({
  formRef,
  handleSave,
  activeNode,
}: AutomationTriggerSidebarCoreFormProps) => {
  const { endpoint } = useAutomationWebhookEndpoint();
  const form = useForm<TIncomingWebhookForm>({
    resolver: zodResolver(incomingWebhookFormSchema),
    defaultValues: {
      ...(activeNode?.config || {}),
    },
  });

  useImperativeHandle(formRef, () => ({
    submit: () =>
      form.handleSubmit(handleSave, () =>
        toast({
          title: 'There is some error in the form',
          variant: 'destructive',
        }),
      )(),
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
              <Form.Item className="w-1/6">
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
              <>
                <Form.Item className="w-full">
                  <Form.Label>Webhook URL</Form.Label>
                  <div className="flex">
                    <span className=" flex items-center h-8 px-3 rounded-sm rounded-r-none bg-accent text-sm text-accent-foreground shadow-xs">
                      {endpoint}
                    </span>
                    <Input
                      {...field}
                      className="rounded-l-none"
                      placeholder="endpoint"
                    />
                  </div>
                </Form.Item>
                <Button
                  variant="secondary"
                  onClick={() => {
                    copyText(`${endpoint}${field.value}`);
                  }}
                >
                  <IconCopy />
                </Button>
              </>
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
              render={({ field }) => {
                return (
                  <Form.Item>
                    <IncomingWebhookHeadersBuilder
                      headers={field.value}
                      onChange={field.onChange}
                    />
                  </Form.Item>
                );
              }}
            />
          </Tabs.Content>
          <Tabs.Content value="body" className="py-4">
            <Form.Field
              control={form.control}
              name="schema"
              render={({ field }) => {
                const previewJson = useMemo(
                  () =>
                    JSON.stringify(
                      generateSchemaPreview(field.value || []),
                      null,
                      2,
                    ),
                  [field.value],
                );

                return (
                  <Form.Item>
                    <div className="flex items-center justify-between">
                      <Form.Label>Payload Schema</Form.Label>
                      <IncomingWebhookPayloadSchemaSheet
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </div>
                    {field.value && (
                      <div className="mt-2 p-3 rounded text-xs font-mono overflow-x-auto max-h-full overflow-y-auto border bg-white">
                        <pre>{previewJson}</pre>
                      </div>
                    )}
                  </Form.Item>
                );
              }}
            />
          </Tabs.Content>
          <Tabs.Content value="settings" className="py-4">
            <Form.Field
              control={form.control}
              name="maxRetries"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Max Retries</Form.Label>
                  <Input {...field} type="number" defaultValue={3} />
                </Form.Item>
              )}
            />
            <Form.Field
              control={form.control}
              name="timeoutMs"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Timeout (seconds)</Form.Label>
                  <Input {...field} type="number" defaultValue={30} />
                </Form.Item>
              )}
            />
            <Form.Field
              control={form.control}
              name="security.secret"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Secret</Form.Label>
                  <Input {...field} type="password" defaultValue={30} />
                </Form.Item>
              )}
            />
            <Form.Field
              control={form.control}
              name="security.beararToken"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Bearar Token</Form.Label>
                  <Input {...field} type="password" defaultValue={30} />
                </Form.Item>
              )}
            />
          </Tabs.Content>
        </Tabs>
      </div>
    </FormProvider>
  );
};
