import { TAutomationWaitEventConfig } from '@/automations/components/builder/nodes/actions/waitEvent/type/waitEvent';
import { IncomingWebhookBodyField } from '@/automations/components/builder/nodes/triggers/webhooks/components/IncomingWebhookBodyField';
import { IncomingWebhookHeadersBuilder } from '@/automations/components/builder/nodes/triggers/webhooks/components/IncomingWebhookHeaderBuilder';
import { IncomingWebhookSettingsField } from '@/automations/components/builder/nodes/triggers/webhooks/components/IncomingWebhookSettingsField';
import { TIncomingWebhookForm } from '@/automations/components/builder/nodes/triggers/webhooks/states/automationIncomingWebhookFormDefinition';
import { TAutomationActionConfigFieldPrefix } from '@/automations/components/builder/nodes/types/coreAutomationActionTypes';
import { TriggerContentWrapper } from '@/automations/components/builder/sidebar/components/content/trigger/wrapper/TriggerContentWrapper';
import { TAutomationBuilderForm } from '@/automations/utils/automationFormDefinitions';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconInfoOctagon } from '@tabler/icons-react';
import { Button, Form, Tabs, toast } from 'erxes-ui';
import { useImperativeHandle, useRef } from 'react';
import {
  FormProvider,
  useForm,
  useFormContext,
  useWatch,
} from 'react-hook-form';
import { z } from 'zod';

export function WaitEventConfigCustomForm({
  configFieldNamePrefix,
  handleSave,
}: {
  configFieldNamePrefix: TAutomationActionConfigFieldPrefix;
  handleSave: (config: TAutomationWaitEventConfig) => void;
}) {
  const { control } = useFormContext<TAutomationBuilderForm>();
  const formRef = useRef<{ submit: () => void }>(null);

  return (
    <TriggerContentWrapper
      className="flex flex-col flex-1 overflow-auto"
      footer={
        <Button onClick={() => formRef.current?.submit()}>
          Save Configuration
        </Button>
      }
    >
      <Form.Field
        name={`${configFieldNamePrefix}.webhookConfig`}
        control={control}
        render={({ field }) => (
          <Form.Item className="flex-1 overflow-auto">
            <Form.Label>Webhook Configuration</Form.Label>

            <Form.Description className="flex flex-row items-center gap-2 text-xs text-muted-foreground mt-1 mb-3 rounded border py-2 px-4">
              <IconInfoOctagon />
              <span>
                Pauses the workflow until an HTTP request is received. The
                endpoint URL is auto-generated. Customize headers, body schema,
                and security as needed (all optional).
              </span>
            </Form.Description>
            <WaitWebhookContent
              formRef={formRef}
              config={field.value}
              handleSave={(
                config: TAutomationWaitEventConfig['webhookConfig'],
              ) => {
                const prevConfig = field.value || {};
                handleSave({
                  ...prevConfig,
                  webhookConfig: {
                    ...config,
                    isEnabledSecurity: !!(
                      config?.security?.beararToken?.trim() ||
                      config?.security?.secret?.trim()
                    ),
                  },
                });
              }}
            />
          </Form.Item>
        )}
      />
    </TriggerContentWrapper>
  );
}

const WaitWebhookContent = ({
  formRef,
  handleSave,
  config,
}: {
  formRef: React.RefObject<{ submit: () => void }>;
  handleSave: (config: TAutomationWaitEventConfig['webhookConfig']) => void;
  config: TAutomationWaitEventConfig['webhookConfig'];
}) => {
  const form = useForm<TIncomingWebhookForm>({
    resolver: zodResolver(
      z.object({
        headers: z
          .array(
            z.object({
              key: z.string(),
              value: z.string(),
              description: z.string(),
            }),
          )
          .optional(),
        // Accept any JSON schema structure for builder compatibility
        schema: z.any().optional(),
        isEnabledSecurity: z.string().optional(),
        security: z
          .object({
            beararToken: z.string().optional(),
            secret: z.string().optional(),
          })
          .optional(),
        timeoutMs: z.string().optional(),
        maxRetries: z.string().optional(),
      }),
    ),
    defaultValues: {
      ...(config || {}),
    },
  });

  useImperativeHandle(formRef, () => ({
    submit: () =>
      form.handleSubmit(handleSave, () => {
        toast({
          title: 'There is some error in the form',
          variant: 'destructive',
        });
      })(),
  }));
  const formValues = useWatch({ control: form.control });

  return (
    <FormProvider {...form}>
      <Tabs defaultValue="headers">
        <Tabs.List>
          <Tabs.Trigger value="headers">
            Headers
            {formValues?.headers?.length && (
              <div className="ml-2 size-1 bg-primary rounded-full" />
            )}
          </Tabs.Trigger>
          <Tabs.Trigger value="body">
            Body
            {formValues?.schema && (
              <div className="ml-2 size-1 bg-primary rounded-full" />
            )}
          </Tabs.Trigger>
          <Tabs.Trigger value="settings">
            Settings
            {formValues?.isEnabledSecurity && (
              <div className="ml-2 size-1 bg-primary rounded-full" />
            )}
          </Tabs.Trigger>
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
    </FormProvider>
  );
};
