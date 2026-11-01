import { IntegrationFormLayout as CallProIntegrationFormLayout } from '@/integrations/components/IntegrationFormLayout';
import { IntegrationFormItem } from '@/integrations/components/IntegrationPanelForm';
import { IconInfoCircle } from '@tabler/icons-react';
import { Alert, Button, Form, Input, Spinner } from 'erxes-ui';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { SelectBrand } from 'ui-modules';
import { CALL_PRO_INTEGRATION_FORM_SCHEMA } from '@/integrations/callpro/constants/callProIntegrationSchema';
import { useCallProConfig } from '@/integrations/callpro/hooks/useCallProConfig';

export const CallProIntegrationForm = ({
  form,
  onSubmit,
  loading,
}: {
  form: UseFormReturn<z.infer<typeof CALL_PRO_INTEGRATION_FORM_SCHEMA>>;
  onSubmit: (data: z.infer<typeof CALL_PRO_INTEGRATION_FORM_SCHEMA>) => void;
  loading?: boolean;
}) => {
  const { t } = useTranslation('frontline', {
    keyPrefix: 'modules.integrations',
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col flex-auto overflow-hidden"
      >
        <CallProIntegrationFormLayout
          actions={
            <Button type="submit" disabled={loading}>
              {loading && <Spinner size="sm" />}
              {t('save')}
            </Button>
          }
        >
          <CallProWebhookHint />
          <Form.Field
            name="name"
            render={({ field }) => (
              <IntegrationFormItem label={t('name')}>
                <Form.Control>
                  <Input {...field} />
                </Form.Control>
                <Form.Message />
              </IntegrationFormItem>
            )}
          />
          <Form.Field
            name="phoneNumber"
            render={({ field }) => (
              <IntegrationFormItem label={t('phone-number')}>
                <Form.Control>
                  <Input {...field} />
                </Form.Control>
                <Form.Message />
              </IntegrationFormItem>
            )}
          />
          <Form.Field
            name="recordUrl"
            render={({ field }) => (
              <IntegrationFormItem label={t('callpro-record-url')}>
                <Form.Control>
                  <Input {...field} value={field.value ?? ''} />
                </Form.Control>
                <Form.Description>
                  {t('callpro-record-url-description')}
                </Form.Description>
                <Form.Message />
              </IntegrationFormItem>
            )}
          />
          <Form.Field
            name="brandId"
            render={({ field }) => (
              <IntegrationFormItem
                label={
                  <>
                    {t('brand')} <span className="text-destructive">*</span>
                  </>
                }
              >
                <Form.Control>
                  <SelectBrand
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder={t('select-a-brand')}
                    className="w-full"
                  />
                </Form.Control>
                <Form.Message />
              </IntegrationFormItem>
            )}
          />
        </CallProIntegrationFormLayout>
      </form>
    </Form>
  );
};

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

export { CallProIntegrationFormLayout };
