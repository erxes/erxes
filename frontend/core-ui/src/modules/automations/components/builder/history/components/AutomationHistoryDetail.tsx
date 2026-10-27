import { AUTOMATION_HISTORY_PANEL } from '../historyPanel';
import { CoreModulePanel } from '@/side-panel/components/CoreModulePanel';
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

export const AutomationHistoryPanel = () => {
  const { isSplitView, selectedExecutionId, selectExecution } =
    useAutomationHistoryView();
  return (
    <CoreModulePanel
      name={AUTOMATION_HISTORY_PANEL}
      open={!!selectedExecutionId && !isSplitView}
      onOpenChange={(open) => !open && selectExecution(null)}
      maxWidth={1100}
      defaultWidth={720}
    >
      <CoreModulePanel.View className="p-0" notFound={!selectedExecutionId}>
        {selectedExecutionId && (
          <AutomationHistoryDetailProvider
            key={selectedExecutionId}
            executionId={selectedExecutionId}
          >
            <AutomationHistorySheetContent isOpen />
          </AutomationHistoryDetailProvider>
        )}
      </CoreModulePanel.View>
    </CoreModulePanel>
  );
};

const AutomationHistorySheetHeader = () => {
  const { t } = useTranslation('automations');
  const title = useAutomationExecutionDetailTitle();

  return (
    <CoreModulePanel.Header className="h-auto py-2">
      <div className="flex min-w-0 items-center gap-2">
        <AutomationExecutionBackButton />
        <div>
          <div className="flex items-center gap-2">
            <CoreModulePanel.Title>{title}</CoreModulePanel.Title>
          </div>
          <CoreModulePanel.Description>
            {t('history-sheet-description')}
          </CoreModulePanel.Description>
        </div>
      </div>
      <CoreModulePanel.Close />
    </CoreModulePanel.Header>
  );
};

export const AutomationHistorySheetContent = ({
  isOpen,
}: {
  isOpen: boolean;
}) => {
  if (!isOpen) {
    return null;
  }
  return (
    <AutomationExecutionDetailProvider>
      <AutomationHistorySheetHeader />
      <CoreModulePanel.Content>
        <AutomationExecutionDetailTabs />
      </CoreModulePanel.Content>
    </AutomationExecutionDetailProvider>
  );
};
