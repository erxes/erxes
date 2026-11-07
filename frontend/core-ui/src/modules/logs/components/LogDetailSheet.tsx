import { PagePanelStatus } from '@/side-panel/components/PagePanelStatus';
import { RecordSidePanel, SidePanelRecordPathContext } from 'ui-modules';
import {
  createPagePanelPortal as createPortal,
  usePagePanel,
  PagePanelContext,
} from '@/side-panel/hooks/usePagePanel';
import { LogDetailView } from '@/logs/components/LogDetailView';
import { useQueryState, cn } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
export function LogDetailSheet() {
  const { t } = useTranslation('common', {
    keyPrefix: 'logs',
  });
  const [logId, setLogId] = useQueryState<string>('logId');
  const pagePanel = usePagePanel({
    name: 'logs/LogDetailSheet',
    open: !!logId,
    onOpenChange: (open) => !open && logId && setLogId(null),
  });
  return (
    <PagePanelContext.Provider value={pagePanel}>
      <SidePanelRecordPathContext.Provider value={pagePanel.path}>
        {pagePanel.open && pagePanel.target
          ? createPortal(
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
                {pagePanel.permissionsLoaded && pagePanel.allowed ? (
                  <>
                    <RecordSidePanel.Header
                      title={<>{t('log-details')}</>}
                      onBack={pagePanel.onBack}
                      onClose={pagePanel.onClose}
                      expanded={pagePanel.expanded}
                      onExpand={pagePanel.onExpand}
                    />
                    <div
                      className={cn(
                        'flex min-h-0 flex-1 flex-col overflow-y-auto',
                        'flex-1 min-h-0 overflow-hidden',
                      )}
                    >
                      {logId && <LogDetailView logId={logId} />}
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
