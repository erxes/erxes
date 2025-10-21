import { OutgoingWebhookAuth } from '@/automations/components/builder/nodes/actions/webhooks/components/OutgoingWebhookAuth';
import { OutgoingWebhookBody } from '@/automations/components/builder/nodes/actions/webhooks/components/OutgoingWebhookBody';
import { OutgoingWebhookHeaders } from '@/automations/components/builder/nodes/actions/webhooks/components/OutgoingWebhookHeaders';
import { OutgoingWebhookOptions } from '@/automations/components/builder/nodes/actions/webhooks/components/OutgoingWebhookOptions';
import { OutgoingWebhookRequest } from '@/automations/components/builder/nodes/actions/webhooks/components/OutgoingWebhookRequest';
import { OutgoingWebhookTabFilledIndicator } from '@/automations/components/builder/nodes/actions/webhooks/components/OutgoingWebhookTabFilledIndicator';
import { OUTGOING_WEBHOOK_FORM_DEFAULT_VALUES } from '@/automations/components/builder/nodes/actions/webhooks/constants/outgoingWebhookForm';
import {
  outgoingWebhookFormSchema,
  TOutgoingWebhookForm,
} from '@/automations/components/builder/nodes/actions/webhooks/states/outgoingWebhookFormSchema';
import { useFormValidationErrorHandler } from '@/automations/hooks/useFormValidationErrorHandler';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Tabs } from 'erxes-ui';
import { merge } from 'lodash';
import { FormProvider, useForm } from 'react-hook-form';
import { TAutomationActionProps } from 'ui-modules';

export const OutgoingWebhookConfigForm = ({
  currentAction,
  handleSave,
}: TAutomationActionProps) => {
  const { handleValidationErrors } = useFormValidationErrorHandler({
    formName: 'Webhook Configuration',
  });

  const form = useForm<TOutgoingWebhookForm>({
    resolver: zodResolver(outgoingWebhookFormSchema),
    defaultValues: merge(
      OUTGOING_WEBHOOK_FORM_DEFAULT_VALUES,
      currentAction?.config || {},
    ),
  });

  return (
    <div className="w-[650px] flex flex-col h-full">
      <Tabs defaultValue="request" className="flex-1 overflow-auto">
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
          <div className="p-6">
            <Tabs.Content value="request">
              <OutgoingWebhookRequest />
            </Tabs.Content>
            <Tabs.Content value="body">
              <OutgoingWebhookBody />
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
      <div className="p-2 flex justify-end border-t bg-white">
        <Button onClick={form.handleSubmit(handleSave, handleValidationErrors)}>
          Save Configuration
        </Button>
      </div>
    </div>
  );
};
