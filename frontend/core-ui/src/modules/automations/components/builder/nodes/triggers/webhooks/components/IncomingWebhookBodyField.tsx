import { IncomingWebhookPayloadSchemaSheet } from '@/automations/components/builder/nodes/triggers/webhooks/components/IncomingWebhookPayloadSchemaSheet';
import { useMemo } from 'react';
import { generateSchemaPreview } from '@/automations/components/builder/nodes/triggers/webhooks/utils/incomingWebhookJsonBuilder';
import { Form } from 'erxes-ui';
import { ControllerRenderProps } from 'react-hook-form';
import { TIncomingWebhookForm } from '@/automations/components/builder/nodes/triggers/webhooks/states/automationIncomingWebhookFormDefinition';
import { IconCodeDots } from '@tabler/icons-react';

export const IncomingWebhookBodyField = ({
  field,
}: {
  field: ControllerRenderProps<TIncomingWebhookForm, 'schema'>;
}) => {
  const previewJson = useMemo(
    () => JSON.stringify(generateSchemaPreview(field.value || []), null, 2),
    [field.value],
  );

  return (
    <Form.Item>
      <div className="flex items-center justify-between">
        <Form.Label>Payload Schema</Form.Label>
        <IncomingWebhookPayloadSchemaSheet
          value={field.value}
          onChange={field.onChange}
        />
      </div>
      {field.value?.length ? (
        <div className="mt-2 p-3 rounded text-xs font-mono overflow-x-auto max-h-full overflow-y-auto border bg-background">
          <pre>{previewJson}</pre>
        </div>
      ) : (
        <div className="mt-2 flex min-h-28 flex-col items-center justify-center gap-2 rounded border border-dashed bg-muted/20 p-4 text-center">
          <IconCodeDots className="size-5 text-muted-foreground" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              No payload schema defined
            </p>
            <p className="text-xs leading-5 text-muted-foreground">
              Add fields to preview the JSON payload this webhook expects.
            </p>
          </div>
        </div>
      )}
    </Form.Item>
  );
};
