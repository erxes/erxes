import { useAutomation } from '@/automations/context/AutomationProvider';
import { copyText } from '@/automations/utils/automationBuilderUtils/triggerUtils';
import { IconCopy, IconInfoCircle } from '@tabler/icons-react';
import { Button, Form, Input, Popover } from 'erxes-ui';
import { ControllerRenderProps } from 'react-hook-form';
import { useAutomationWebhookEndpoint } from '../hooks/useAutomationWebhookEndpoint';
import { TIncomingWebhookForm } from '../states/automationIncomingWebhookFormDefinition';

export const IncomingWebhookEndpointField = ({
  field,
}: {
  field: ControllerRenderProps<TIncomingWebhookForm, 'endpoint'>;
}) => {
  const { endpoint } = useAutomationWebhookEndpoint();

  return (
    <>
      <Form.Item className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 mb-0">
          <Form.Label>Webhook URL</Form.Label>
          <WebhookUrlCreatePageInfo />
        </div>
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

const WebhookUrlCreatePageInfo = () => {
  const { isCreatePage } = useAutomation();

  if (!isCreatePage) {
    return null;
  }

  return (
    <Popover>
      <Popover.Trigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-6 text-muted-foreground hover:text-foreground"
          aria-label="Webhook URL information"
        >
          <IconInfoCircle className="size-4" />
        </Button>
      </Popover.Trigger>
      <Popover.Content align="start" className="w-80 p-4">
        <div className="space-y-1">
          <div className="text-sm font-semibold text-foreground">
            Webhook URL
          </div>
          <p className="text-sm leading-5 text-muted-foreground">
            The final webhook URL will be available after this automation is
            created. Save the automation to generate the endpoint you can send
            webhook requests to.
          </p>
        </div>
      </Popover.Content>
    </Popover>
  );
};
