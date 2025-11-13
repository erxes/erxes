import { UseFormReturn } from 'react-hook-form';
import { TIncomingWebhookForm } from '@/automations/components/builder/nodes/triggers/webhooks/states/automationIncomingWebhookFormDefinition';
import { Form, Input } from 'erxes-ui';
export const IncomingWebhookSettingsField = ({
  form,
}: {
  form: UseFormReturn<TIncomingWebhookForm>;
}) => {
  return (
    <>
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
    </>
  );
};
