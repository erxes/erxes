import { TIncomingWebhookJSONPropertySchema } from '@/automations/components/builder/nodes/triggers/webhooks/types/incomingWebhookJsonBuilder';
import { PagePanelStatus } from '@/side-panel/components/PagePanelStatus';
import { RecordSidePanel, SidePanelRecordPathContext } from 'ui-modules';
import {
  createPagePanelPortal as createPortal,
  usePagePanel,
  PagePanelContext,
} from '@/side-panel/hooks/usePagePanel';
import { IconCode } from '@tabler/icons-react';
import { Button, cn } from 'erxes-ui';
import { IncomingWebhookPayloadSchemaGenerator } from '@/automations/components/builder/nodes/triggers/webhooks/components/IncomingWebhookPayloadSchemaGenerator';
import { useTranslation } from 'react-i18next';
interface Props {
  value?: TIncomingWebhookJSONPropertySchema[];
  onChange: (next: TIncomingWebhookJSONPropertySchema[]) => void;
}
export function IncomingWebhookPayloadSchemaSheet({ value, onChange }: Props) {
  const { t } = useTranslation('automations');
  const pagePanel = usePagePanel({
    name: 'automations/builder/nodes/triggers/webhooks/IncomingWebhookPayloadSchemaSheet',
  });
  return (
    <PagePanelContext.Provider value={pagePanel}>
      <SidePanelRecordPathContext.Provider value={pagePanel.path}>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={pagePanel.onOpen}
        >
          <IconCode className="size-4" /> {t('webhook-trigger-edit-schema')}
        </Button>
        {pagePanel.open && pagePanel.target
          ? createPortal(
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
                {pagePanel.permissionsLoaded && pagePanel.allowed ? (
                  <>
                    <RecordSidePanel.Header
                      title={
                        <>
                          <div>
                            <span>
                              {t('webhook-trigger-schema-builder-title')}
                            </span>
                            <p>
                              {t('webhook-trigger-schema-builder-description')}
                            </p>
                          </div>
                        </>
                      }
                      onBack={pagePanel.onBack}
                      onClose={pagePanel.onClose}
                      expanded={pagePanel.expanded}
                      onExpand={pagePanel.onExpand}
                    />
                    <div
                      className={cn(
                        'flex min-h-0 flex-1 flex-col overflow-y-auto',
                      )}
                    >
                      <div className="p-4">
                        <IncomingWebhookPayloadSchemaGenerator
                          value={value}
                          onChange={onChange}
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <PagePanelStatus entry={pagePanel} />
                )}
              </div>,
              pagePanel.target,
            )
          : null}
      </SidePanelRecordPathContext.Provider>
    </PagePanelContext.Provider>
  );
}
