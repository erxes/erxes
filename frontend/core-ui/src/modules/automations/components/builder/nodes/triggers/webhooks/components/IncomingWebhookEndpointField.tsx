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
      <Form.Item className="min-w-0 flex-1">
        <Form.Label>Webhook URL</Form.Label>
        <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_minmax(8rem,12rem)] overflow-hidden rounded-md border bg-background">
          <div
            className="flex min-w-0 items-center border-r bg-muted px-3 text-sm text-muted-foreground"
            title={endpoint}
          >
            <span className="truncate">{endpoint}</span>
          </div>

          <Input
            {...field}
            onChange={(e) => field.onChange(e.target.value)}
            className=" min-w-0 rounded-none border-0 shadow-none focus-visible:ring-0"
            placeholder="endpoint"
          />
        </div>
      </Form.Item>
      <Button
        variant="secondary"
        size="icon"
        className="shrink-0"
        onClick={() => {
          copyText(`${endpoint}${field.value}`);
        }}
      >
        <IconCopy />
      </Button>
    </>
  );
};
