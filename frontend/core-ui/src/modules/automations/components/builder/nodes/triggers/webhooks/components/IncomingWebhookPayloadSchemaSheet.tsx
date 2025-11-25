import { IconCode } from '@tabler/icons-react';
import { Button, Sheet } from 'erxes-ui';
import { IncomingWebhookPayloadSchemaGenerator } from '@/automations/components/builder/nodes/triggers/webhooks/components/IncomingWebhookPayloadSchemaGenerator';
import { TIncomingWebhookJSONPropertySchema } from '@/automations/components/builder/nodes/triggers/webhooks/types/incomingWebhookJsonBuilder';

interface Props {
  value?: TIncomingWebhookJSONPropertySchema[];
  onChange: (next: TIncomingWebhookJSONPropertySchema[]) => void;
}

export function IncomingWebhookPayloadSchemaSheet({ value, onChange }: Props) {
  return (
    <Sheet>
      <Sheet.Trigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <IconCode className="size-4" /> Edit Payload Schema
        </Button>
      </Sheet.Trigger>
      <Sheet.View className="p-0 md:w-[calc(90vw-theme(spacing.4))] flex flex-col gap-0 transition-all duration-100 ease-out overflow-hidden flex-none sm:max-w-screen-2xl">
        <Sheet.Header>
          <div>
            <Sheet.Title>Payload Schema Builder</Sheet.Title>
            <Sheet.Description>
              Define required properties and data types for incoming payloads.
            </Sheet.Description>
          </div>
          <Sheet.Close />
        </Sheet.Header>
        <Sheet.Content>
          <div className="p-4">
            <IncomingWebhookPayloadSchemaGenerator
              value={value}
              onChange={onChange}
            />
          </div>
        </Sheet.Content>
      </Sheet.View>
    </Sheet>
  );
}
