import { useTranslation } from 'react-i18next';
import { TAutomationWaitEventConfig } from '@/automations/components/builder/nodes/actions/waitEvent/type/waitEvent';
import { IncomingWebhookBodyField } from '@/automations/components/builder/nodes/triggers/webhooks/components/IncomingWebhookBodyField';
import { IncomingWebhookHeadersBuilder } from '@/automations/components/builder/nodes/triggers/webhooks/components/IncomingWebhookHeaderBuilder';
import { IncomingWebhookSettingsField } from '@/automations/components/builder/nodes/triggers/webhooks/components/IncomingWebhookSettingsField';
import {
  useWaitEventConfigCustomForm,
  useWaitWebhookContent,
} from '@/automations/components/builder/nodes/actions/waitEvent/hooks/useWaitEventConfigCustomForm';
import { TAutomationActionConfigFieldPrefix } from '@/automations/components/builder/nodes/types/coreAutomationActionTypes';
import { TriggerContentWrapper } from '@/automations/components/builder/sidebar/components/content/trigger/wrapper/TriggerContentWrapper';
import { IconInfoOctagon } from '@tabler/icons-react';
import { Button, Form, Tabs } from 'erxes-ui';
import { FormProvider } from 'react-hook-form';

export function WaitEventConfigCustomForm({
  configFieldNamePrefix,
  handleSave,
}: {
  configFieldNamePrefix: TAutomationActionConfigFieldPrefix;
  handleSave: (config: TAutomationWaitEventConfig) => void;
}) {
  const { t } = useTranslation('automations');
  const { control, formRef, submit, saveWebhookConfig } =
    useWaitEventConfigCustomForm(handleSave);

  return (
    <TriggerContentWrapper
      className="flex flex-col flex-1 overflow-auto"
      footer={<Button onClick={submit}>{t('save-configuration')}</Button>}
    >
      <Form.Field
        name={`${configFieldNamePrefix}.webhookConfig`}
        control={control}
        render={({ field }) => (
          <Form.Item className="flex-1 overflow-auto">
            <Form.Label>{t('wait-event-webhook-configuration')}</Form.Label>

            <Form.Description className="flex flex-row items-center gap-2 text-xs text-muted-foreground mt-1 mb-3 rounded border py-2 px-4">
              <IconInfoOctagon />
              <span>{t('wait-event-webhook-description')}</span>
            </Form.Description>
            <WaitWebhookContent
              formRef={formRef}
              config={field.value}
              handleSave={saveWebhookConfig(field.value)}
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
  const { t } = useTranslation('automations');
  const { form, hasHeaders, hasSchema, hasSecurity } = useWaitWebhookContent({
    formRef,
    config,
    handleSave,
  });

  return (
    <FormProvider {...form}>
      <Tabs defaultValue="headers">
        <Tabs.List>
          <Tabs.Trigger value="headers">
            {t('headers')}
            {hasHeaders && (
              <div className="ml-2 size-1 bg-primary rounded-full" />
            )}
          </Tabs.Trigger>
          <Tabs.Trigger value="body">
            {t('body')}
            {hasSchema && (
              <div className="ml-2 size-1 bg-primary rounded-full" />
            )}
          </Tabs.Trigger>
          <Tabs.Trigger value="settings">
            {t('wait-event-settings')}
            {hasSecurity && (
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
