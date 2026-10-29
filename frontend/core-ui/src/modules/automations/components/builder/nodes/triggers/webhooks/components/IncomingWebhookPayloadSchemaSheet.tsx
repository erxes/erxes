import { CoreModulePanel } from '@/side-panel/components/CoreModulePanel';
import { IconCode } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { IncomingWebhookPayloadSchemaGenerator } from '@/automations/components/builder/nodes/triggers/webhooks/components/IncomingWebhookPayloadSchemaGenerator';
import { TIncomingWebhookJSONPropertySchema } from '@/automations/components/builder/nodes/triggers/webhooks/types/incomingWebhookJsonBuilder';
import { useTranslation } from 'react-i18next';

interface Props {
  value?: TIncomingWebhookJSONPropertySchema[];
  onChange: (next: TIncomingWebhookJSONPropertySchema[]) => void;
}

export function IncomingWebhookPayloadSchemaSheet({ value, onChange }: Props) {
  const { t } = useTranslation('automations');
  return (
    <CoreModulePanel
      name={
        'automations/builder/nodes/triggers/webhooks/IncomingWebhookPayloadSchemaSheet'
      }
    >
      <CoreModulePanel.Trigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <IconCode className="size-4" /> {t('webhook-trigger-edit-schema')}
        </Button>
      </CoreModulePanel.Trigger>
      <CoreModulePanel.View className="p-0 md:w-[calc(90vw-theme(spacing.4))] flex flex-col gap-0 transition-all duration-100 ease-out overflow-hidden flex-none sm:max-w-screen-2xl">
        <CoreModulePanel.Header className="h-auto py-2">
          <div>
            <CoreModulePanel.Title>
              {t('webhook-trigger-schema-builder-title')}
            </CoreModulePanel.Title>
            <CoreModulePanel.Description>
              {t('webhook-trigger-schema-builder-description')}
            </CoreModulePanel.Description>
          </div>
          <CoreModulePanel.Close />
        </CoreModulePanel.Header>
        <CoreModulePanel.Content>
          <div className="p-4">
            <IncomingWebhookPayloadSchemaGenerator
              value={value}
              onChange={onChange}
            />
          </div>
        </CoreModulePanel.Content>
      </CoreModulePanel.View>
    </CoreModulePanel>
  );
}
