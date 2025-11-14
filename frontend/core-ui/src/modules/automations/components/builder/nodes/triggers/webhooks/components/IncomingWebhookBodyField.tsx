import { IncomingWebhookPayloadSchemaSheet } from '@/automations/components/builder/nodes/triggers/webhooks/components/IncomingWebhookPayloadSchemaSheet';
import { useMemo } from 'react';
import { generateSchemaPreview } from '@/automations/components/builder/nodes/triggers/webhooks/utils/incomingWebhookJsonBuilder';
import { Form } from 'erxes-ui';
import { ControllerRenderProps } from 'react-hook-form';
import { TIncomingWebhookForm } from '@/automations/components/builder/nodes/triggers/webhooks/states/automationIncomingWebhookFormDefinition';

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
      {field.value && (
        <div className="mt-2 p-3 rounded text-xs font-mono overflow-x-auto max-h-full overflow-y-auto border bg-white">
          <pre>{previewJson}</pre>
        </div>
      )}
    </Form.Item>
  );
};
