import { TAutomationWaitEventConfig } from '@/automations/components/builder/nodes/actions/waitEvent/type/waitEvent';
import { TIncomingWebhookForm } from '@/automations/components/builder/nodes/triggers/webhooks/states/automationIncomingWebhookFormDefinition';
import { TAutomationBuilderForm } from '@/automations/utils/automationFormDefinitions';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'erxes-ui';
import { RefObject, useCallback, useImperativeHandle, useRef } from 'react';
import { useForm, useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

type TWebhookConfig = TAutomationWaitEventConfig['webhookConfig'];
type TSubmitRef = { submit: () => void };

const waitWebhookSchema = z.object({
  headers: z
    .array(
      z.object({ key: z.string(), value: z.string(), description: z.string() }),
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
});

// Security counts as on once a token or a secret is filled in
const hasSecurity = (config: TWebhookConfig) =>
  !!(config?.security?.beararToken?.trim() || config?.security?.secret?.trim());

/** The custom wait form: its save button submits the nested webhook form. */
export const useWaitEventConfigCustomForm = (
  handleSave: (config: TAutomationWaitEventConfig) => void,
) => {
  const { control } = useFormContext<TAutomationBuilderForm>();
  const formRef = useRef<TSubmitRef>(null);

  const submit = useCallback(() => formRef.current?.submit(), []);

  const saveWebhookConfig = useCallback(
    (previous: TAutomationWaitEventConfig | undefined) =>
      (config: TWebhookConfig) =>
        // Saved as a boolean although the form types it as text, as before
        handleSave({
          ...(previous || {}),
          webhookConfig: { ...config, isEnabledSecurity: hasSecurity(config) },
        } as unknown as TAutomationWaitEventConfig),
    [handleSave],
  );

  return { control, formRef, submit, saveWebhookConfig };
};

/** The webhook's headers, body and settings, and which of them are filled. */
export const useWaitWebhookContent = ({
  formRef,
  config,
  handleSave,
}: {
  formRef: RefObject<TSubmitRef>;
  config: TWebhookConfig;
  handleSave: (config: TWebhookConfig) => void;
}) => {
  const { t } = useTranslation('automations');
  const form = useForm<TIncomingWebhookForm>({
    resolver: zodResolver(waitWebhookSchema),
    defaultValues: { ...(config || {}) },
  });

  useImperativeHandle(formRef, () => ({
    submit: () =>
      form.handleSubmit(handleSave, () => {
        toast({ title: t('wait-event-form-error'), variant: 'destructive' });
      })(),
  }));

  const formValues = useWatch({ control: form.control });

  return {
    form,
    hasHeaders: !!formValues?.headers?.length,
    hasSchema: !!formValues?.schema,
    hasSecurity: !!formValues?.isEnabledSecurity,
  };
};
