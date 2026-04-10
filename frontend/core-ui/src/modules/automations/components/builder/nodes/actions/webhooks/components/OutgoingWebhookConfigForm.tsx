import { OutgoingWebhookAuth } from '@/automations/components/builder/nodes/actions/webhooks/components/OutgoingWebhookAuth';
import { OutgoingWebhookHeaders } from '@/automations/components/builder/nodes/actions/webhooks/components/OutgoingWebhookHeaders';
import { OutgoingWebhookOptions } from '@/automations/components/builder/nodes/actions/webhooks/components/OutgoingWebhookOptions';
import { OutgoingWebhookRequest } from '@/automations/components/builder/nodes/actions/webhooks/components/OutgoingWebhookRequest';
import { OutgoingWebhookTabFilledIndicator } from '@/automations/components/builder/nodes/actions/webhooks/components/OutgoingWebhookTabFilledIndicator';
import { OUTGOING_WEBHOOK_FORM_DEFAULT_VALUES } from '@/automations/components/builder/nodes/actions/webhooks/constants/outgoingWebhookForm';
import {
  outgoingWebhookFormSchema,
  TOutgoingWebhookForm,
} from '@/automations/components/builder/nodes/actions/webhooks/states/outgoingWebhookFormSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Form, Tabs } from 'erxes-ui';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment, @typescript-eslint/no-var-requires
// @ts-ignore
import { merge } from 'lodash';
import { OutgoingWebhookBodyBuilder } from '@/automations/components/builder/nodes/actions/webhooks/components/OutgoingWebhookBodyBuilder';
import { normalizeOutgoingWebhookBodyValue } from '@/automations/components/builder/nodes/actions/webhooks/utils/outgoingWebhookBodyBuilder';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import {
  TAutomationActionProps,
  useFormValidationErrorHandler,
} from 'ui-modules';
import { useMemo } from 'react';

export const OutgoingWebhookConfigForm = ({
  currentAction,
  handleSave,
}: TAutomationActionProps) => {
  const { handleValidationErrors } = useFormValidationErrorHandler({
    formName: 'Webhook Configuration',
  });
  const defaultValues = useMemo(() => {
    const merged = merge(
      {},
      OUTGOING_WEBHOOK_FORM_DEFAULT_VALUES,
      currentAction?.config || {},
    );

    merged.body = normalizeOutgoingWebhookBodyValue(
      merged.body,
      merged.bodyMode,
    );

    return merged;
  }, [currentAction?.config]);
  const form = useForm<TOutgoingWebhookForm>({
    resolver: zodResolver(outgoingWebhookFormSchema),
    defaultValues,
  });
  const bodyMode = useWatch({
    control: form.control,
    name: 'bodyMode',
  });

  return (
    <div className="w-[650px] flex flex-col h-full">
      <Tabs
        defaultValue="request"
        className="flex-1 overflow-auto flex flex-col"
      >
        <Tabs.List className="w-full" defaultValue="request">
          <Tabs.Trigger className="w-1/5" value="request">
            Request
            <OutgoingWebhookTabFilledIndicator
              control={form.control}
              fields={['method', 'url', 'queryParams']}
              formErrors={form.formState.errors}
            />
          </Tabs.Trigger>
          <Tabs.Trigger className="w-1/5" value="body">
            Body
            <OutgoingWebhookTabFilledIndicator
              control={form.control}
              fields={['body']}
              formErrors={form.formState.errors}
            />
          </Tabs.Trigger>

          <Tabs.Trigger className="w-1/5" value="auth">
            Auth
            <OutgoingWebhookTabFilledIndicator
              control={form.control}
              fields={['auth']}
              formErrors={form.formState.errors}
            />
          </Tabs.Trigger>
          <Tabs.Trigger className="w-1/5" value="header">
            Headers
            <OutgoingWebhookTabFilledIndicator
              control={form.control}
              fields={['headers']}
              formErrors={form.formState.errors}
            />
          </Tabs.Trigger>

          <Tabs.Trigger className="w-1/5" value="options">
            Options
            <OutgoingWebhookTabFilledIndicator
              control={form.control}
              fields={['options']}
              formErrors={form.formState.errors}
            />
          </Tabs.Trigger>
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
                    bodyMode={bodyMode || 'json'}
                    value={field.value}
                    onChange={field.onChange}
                    onBodyModeChange={(value) => {
                      form.setValue('bodyMode', value, { shouldDirty: true });

                      const currentBody = form.getValues('body');
                      if (value === 'text' && currentBody.trim() === '{}') {
                        form.setValue('body', '', { shouldDirty: true });
                      }

                      if (value === 'json' && !currentBody.trim()) {
                        form.setValue('body', '{}', { shouldDirty: true });
                      }
                    }}
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
        <Button onClick={form.handleSubmit(handleSave, handleValidationErrors)}>
          Save Configuration
        </Button>
      </div>
    </div>
  );
};
