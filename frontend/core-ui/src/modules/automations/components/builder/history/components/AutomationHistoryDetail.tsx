import { RecordSidePanel } from 'ui-modules';
import { PagePanelStatus } from '@/side-panel/components/PagePanelStatus';
import {
  createPagePanelPortal as createPortal,
  usePagePanel,
  usePagePanelContext,
} from '@/side-panel/hooks/usePagePanel';
import { AUTOMATION_HISTORY_PANEL } from '@/automations/components/builder/history/historyPanel';
import {
  AutomationExecutionBackButton,
  AutomationExecutionDetailTabs,
  useAutomationExecutionDetailTitle,
} from '@/automations/components/builder/history/components/AutomationExecutionDetailView';
import { AutomationExecutionDetailProvider } from '@/automations/components/builder/history/context/AutomationExecutionDetailContext';
import { AutomationHistoryDetailProvider } from '@/automations/components/builder/history/context/AutomationHistoryDetailContext';
import { useAutomationHistoryView } from '@/automations/components/builder/history/hooks/useAutomationHistoryView';
import { IconEye } from '@tabler/icons-react';
import { cn, RecordTable, RecordTableInlineCell } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
export const AutomationHistoryDetail = ({
  executionId,
}: {
  executionId: string;
}) => {
  const { t } = useTranslation('automations');
  const { selectedExecutionId, selectExecution } = useAutomationHistoryView();
  return (
    <RecordTableInlineCell className="p-0">
      <RecordTable.MoreButton
        className="w-full h-full"
        aria-label={t('history-show-execution-detail')}
        onClick={() => selectExecution(executionId)}
      >
        <IconEye
          className={cn(selectedExecutionId === executionId && 'text-primary')}
        />
      </RecordTable.MoreButton>
    </RecordTableInlineCell>
  );
};
export const AutomationHistoryPanel = ({
  automationId,
}: {
  automationId?: string;
}) => {
  const { isSplitView, selectedExecutionId, selectExecution } =
    useAutomationHistoryView();
  const pagePanel = usePagePanel({
    name: AUTOMATION_HISTORY_PANEL,
    open: !!selectedExecutionId && !isSplitView,
    onOpenChange: (open) => !open && !isSplitView && selectExecution(null),
    maxWidth: 1100,
    defaultWidth: 720,
    identity: selectedExecutionId || 'new',
  });
  return createPortal(
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
      {pagePanel.permissionsLoaded &&
      pagePanel.allowed &&
      !!selectedExecutionId ? (
        <>
          {selectedExecutionId && (
            <AutomationHistoryDetailProvider
              key={selectedExecutionId}
              executionId={selectedExecutionId}
            >
              <AutomationHistorySheetContent
                isOpen
                automationId={automationId}
              />
            </AutomationHistoryDetailProvider>
          )}
        </>
      ) : (
        <PagePanelStatus entry={pagePanel} />
      )}
    </div>,
    pagePanel,
  );
};
const AutomationHistorySheetHeader = () => {
  const { t } = useTranslation('automations');
  const title = useAutomationExecutionDetailTitle();
  const pagePanel = usePagePanelContext();
  return (
    <RecordSidePanel.Header
      title={
        <div className="flex min-w-0 items-center gap-2">
          <AutomationExecutionBackButton />
          <div>
            <div className="flex items-center gap-2">
              <span>{title}</span>
            </div>
            <p>{t('history-sheet-description')}</p>
          </div>
        </div>
      }
      {...pagePanel.headerProps}
    />
  );
};
export const AutomationHistorySheetContent = ({
  isOpen,
  automationId,
}: {
  isOpen: boolean;
  automationId?: string;
}) => {
  if (!isOpen) {
    return null;
  }
  return (
    <AutomationExecutionDetailProvider automationId={automationId}>
      <AutomationHistorySheetHeader />
      <div className={cn('flex min-h-0 flex-1 flex-col overflow-y-auto')}>
        <AutomationExecutionDetailTabs />
      </div>
    </AutomationExecutionDetailProvider>
  );
};
