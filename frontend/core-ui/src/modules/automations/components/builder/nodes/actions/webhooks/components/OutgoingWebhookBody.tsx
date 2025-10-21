import { Form, Label } from 'erxes-ui';
import { useFormContext } from 'react-hook-form';
import { TOutgoingWebhookForm } from '@/automations/components/builder/nodes/actions/webhooks/states/outgoingWebhookFormSchema';
import { OutgoingWebhookBodyBuilder } from '@/automations/components/builder/nodes/actions/webhooks/components/OutgoingWebhookBodyBuilder';

export const OutgoingWebhookBody = () => {
  const { control } = useFormContext<TOutgoingWebhookForm>();
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Body</Label>
      </div>
      <Form.Field
        control={control}
        name="body"
        render={() => (
          <Form.Item>
            <Form.Message />
            <OutgoingWebhookBodyBuilder name="body" />
          </Form.Item>
        )}
      />
    </div>
  );
};
