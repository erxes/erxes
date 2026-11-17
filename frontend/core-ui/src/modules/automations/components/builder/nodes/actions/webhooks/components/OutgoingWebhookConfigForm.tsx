import { OutgoingWebhookAuth } from '@/automations/components/builder/nodes/actions/webhooks/components/OutgoingWebhookAuth';
import { OutgoingWebhookBodyBuilder } from '@/automations/components/builder/nodes/actions/webhooks/components/OutgoingWebhookBodyBuilder';
import { OutgoingWebhookHeaders } from '@/automations/components/builder/nodes/actions/webhooks/components/OutgoingWebhookHeaders';
import { OutgoingWebhookOptions } from '@/automations/components/builder/nodes/actions/webhooks/components/OutgoingWebhookOptions';
import { OutgoingWebhookRequest } from '@/automations/components/builder/nodes/actions/webhooks/components/OutgoingWebhookRequest';
import { OutgoingWebhookTabFilledIndicator } from '@/automations/components/builder/nodes/actions/webhooks/components/OutgoingWebhookTabFilledIndicator';
import {
  OUTGOING_WEBHOOK_TABS,
  useOutgoingWebhookConfigForm,
} from '@/automations/components/builder/nodes/actions/webhooks/hooks/useOutgoingWebhookConfigForm';
import { Button, Form, Tabs } from 'erxes-ui';
import { FormProvider } from 'react-hook-form';
import { TAutomationActionProps } from 'ui-modules';
import { useTranslation } from 'react-i18next';

export const OutgoingWebhookConfigForm = ({
  currentAction,
  handleSave,
}: TAutomationActionProps) => {
  const { t } = useTranslation('automations');
  const { form, bodyMode, onBodyModeChange, onSave } =
    useOutgoingWebhookConfigForm({ currentAction, handleSave });

  return (
    <div className="w-[650px] flex flex-col h-full">
      <Tabs
        defaultValue="request"
        className="flex-1 overflow-auto flex flex-col"
      >
        <Tabs.List className="w-full" defaultValue="request">
          {OUTGOING_WEBHOOK_TABS.map((tab) => (
            <Tabs.Trigger key={tab.value} className="w-1/5" value={tab.value}>
              {t(tab.labelKey)}
              <OutgoingWebhookTabFilledIndicator
                control={form.control}
                fields={tab.fields}
                formErrors={form.formState.errors}
              />
            </Tabs.Trigger>
          ))}
        </Tabs.List>
        <FormProvider {...form}>
          <div className="flex-1 p-6">
            <Tabs.Content value="request">
              <OutgoingWebhookRequest />
            </Tabs.Content>
            <Tabs.Content value="body" className="h-full flex-1">
              <Form.Field
                control={form.control}
                name="body"
                render={({ field }) => (
                  <OutgoingWebhookBodyBuilder
                    bodyMode={bodyMode}
                    value={field.value}
                    onChange={field.onChange}
                    onBodyModeChange={onBodyModeChange}
                  />
                )}
              />
            </Tabs.Content>

            <Tabs.Content value="auth">
              <OutgoingWebhookAuth />
            </Tabs.Content>
            <Tabs.Content value="header">
              <OutgoingWebhookHeaders />
            </Tabs.Content>

            <Tabs.Content value="options">
              <OutgoingWebhookOptions />
            </Tabs.Content>
          </div>
        </FormProvider>
      </Tabs>
      <div className="p-2 flex justify-end border-t bg-background">
        <Button onClick={onSave}>{t('save-configuration')}</Button>
      </div>
    </div>
  );
};
