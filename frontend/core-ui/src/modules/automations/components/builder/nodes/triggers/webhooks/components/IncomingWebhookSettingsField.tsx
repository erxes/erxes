import { UseFormReturn } from 'react-hook-form';
import { TIncomingWebhookForm } from '@/automations/components/builder/nodes/triggers/webhooks/states/automationIncomingWebhookFormDefinition';
import { Form, Input } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
export const IncomingWebhookSettingsField = ({
  form,
}: {
  form: UseFormReturn<TIncomingWebhookForm>;
}) => {
  const { t } = useTranslation('automations');
  return (
    <>
      <Form.Field
        control={form.control}
        name="maxRetries"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('webhook-trigger-max-retries')}</Form.Label>
            <Input {...field} type="number" defaultValue={3} />
          </Form.Item>
        )}
      />
      <Form.Field
        control={form.control}
        name="timeoutMs"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('webhook-trigger-timeout-seconds')}</Form.Label>
            <Input {...field} type="number" defaultValue={30} />
          </Form.Item>
        )}
      />
      <Form.Field
        control={form.control}
        name="security.secret"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('webhook-trigger-secret')}</Form.Label>
            <Input
              {...field}
              type="password"
              placeholder={t('webhook-trigger-secret-placeholder')}
            />
          </Form.Item>
        )}
      />
      <Form.Field
        control={form.control}
        name="security.beararToken"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('webhook-trigger-bearer-token')}</Form.Label>
            <Input
              {...field}
              type="password"
              placeholder={t('webhook-trigger-bearer-token-placeholder')}
            />
          </Form.Item>
        )}
      />
    </>
  );
};
