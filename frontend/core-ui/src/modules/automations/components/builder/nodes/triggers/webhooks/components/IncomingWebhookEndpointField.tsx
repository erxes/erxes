import { copyText } from '@/automations/utils/automationBuilderUtils/triggerUtils';
import { IconCopy } from '@tabler/icons-react';
import { Button, Form, Input } from 'erxes-ui';
import { ControllerRenderProps } from 'react-hook-form';
import { TIncomingWebhookForm } from '../states/automationIncomingWebhookFormDefinition';
import { useAutomationWebhookEndpoint } from '../hooks/useAutomationWebhookEndpoint';

export const IncomingWebhookEndpointField = ({
  field,
}: {
  field: ControllerRenderProps<TIncomingWebhookForm, 'endpoint'>;
}) => {
  const { endpoint } = useAutomationWebhookEndpoint();

  return (
    <>
      <Form.Item className="w-full">
        <Form.Label>Webhook URL</Form.Label>
        <div className="flex w-96">
          <Input value={endpoint} className="w-1/2 rounded-r-none" disabled />
          <Input
            {...field}
            onChange={(e) => field.onChange(e.target.value)}
            className="w-1/2 rounded-l-none"
            placeholder="endpoint"
          />
        </div>
      </Form.Item>
      <Button
        variant="secondary"
        onClick={() => {
          copyText(`${endpoint}${field.value}`);
        }}
      >
        <IconCopy />
      </Button>
    </>
  );
};
