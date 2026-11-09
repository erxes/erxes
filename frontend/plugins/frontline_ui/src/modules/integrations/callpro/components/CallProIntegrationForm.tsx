import {
  IntegrationNameField,
  IntegrationBrandField,
} from '@/integrations/components/IntegrationFormFields';
import {
  PanelFormLayout,
  useSidePanel,
  PanelFormRow,
  PANEL_INPUT_CLASS_NAME,
} from 'ui-modules';

import { IconInfoCircle } from '@tabler/icons-react';
import { Alert, Form, Input } from 'erxes-ui';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { CALL_PRO_INTEGRATION_FORM_SCHEMA } from '@/integrations/callpro/constants/callProIntegrationSchema';
import { useCallProConfig } from '@/integrations/callpro/hooks/useCallProConfig';

/** Shows the configured Call Pro webhook URL when available. */
export const CallProWebhookHint = () => {
  const { t } = useTranslation('frontline', {
    keyPrefix: 'modules.integrations',
  });
  const { webhookUrl } = useCallProConfig();

  if (!webhookUrl) {
    return null;
  }

  return (
    <Alert className="col-span-full">
      <IconInfoCircle className="size-4" />
      <Alert.Title>{t('callpro-webhook-title')}</Alert.Title>
      <Alert.Description>
        {t('callpro-webhook-description')}
        <code className="mt-1 block break-all font-mono text-xs">
          {webhookUrl}
        </code>
      </Alert.Description>
    </Alert>
  );
};

/** Renders the shared Call Pro create and edit form with validation feedback. */
export const CallProIntegrationForm = ({
  form,
  onSubmit,
  loading,
}: {
  form: UseFormReturn<z.infer<typeof CALL_PRO_INTEGRATION_FORM_SCHEMA>>;
  onSubmit: (data: z.infer<typeof CALL_PRO_INTEGRATION_FORM_SCHEMA>) => void;
  loading?: boolean;
}) => {
  const { close } = useSidePanel();
  const { t } = useTranslation('frontline', {
    keyPrefix: 'modules.integrations',
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col flex-auto overflow-hidden"
      >
        <PanelFormLayout onCancel={close} saving={loading}>
          <CallProWebhookHint />
          <IntegrationNameField
            registration={form.register('name')}
            error={form.formState.errors.name?.message}
          />
          <PanelFormRow
            label={t('phone-number')}
            error={form.formState.errors.phoneNumber?.message}
          >
            <Input
              {...form.register('phoneNumber')}
              className={PANEL_INPUT_CLASS_NAME}
            />
          </PanelFormRow>
          <Form.Field
            name="recordUrl"
            render={({ field }) => (
              <Form.Item>
                <PanelFormRow label={t('callpro-record-url')}>
                  <Form.Control>
                    <Input {...field} value={field.value ?? ''} />
                  </Form.Control>
                  <Form.Description>
                    {t('callpro-record-url-description')}
                  </Form.Description>
                  <Form.Message />
                </PanelFormRow>
              </Form.Item>
            )}
          />
          <IntegrationBrandField outerRow required />
        </PanelFormLayout>
      </form>
    </Form>
  );
};
