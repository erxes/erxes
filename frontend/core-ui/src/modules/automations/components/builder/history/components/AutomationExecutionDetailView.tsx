import { AutomationHistoryFlow } from '@/automations/components/builder/history/components/flow/AutomationHistoryFlow';
import { AutomationHistoryByTable } from '@/automations/components/builder/history/components/AutomationHistoryByTable';
import { AutomationHistoryResultName } from '@/automations/components/builder/history/components/AutomationHistoryResultName';
import { useAutomationExecutionDetail } from '@/automations/components/builder/history/context/AutomationExecutionDetailContext';
import { AutomationErrorEmptyState } from '@/automations/components/common/AutomationErrorEmptyState';
import { AutomationExecutionResultPanel } from '@/automations/components/builder/history/components/result/AutomationExecutionResultPanel';
import {
  AutomationExecutionSelectionProvider,
  useAutomationExecutionSelection,
} from '@/automations/components/builder/history/context/AutomationExecutionSelectionContext';
import { useAutomationHistoryDetail } from '@/automations/components/builder/history/context/AutomationHistoryDetailContext';
import {
  IconArrowLeft,
  IconAutomaticGearbox,
  IconTournament,
} from '@tabler/icons-react';
import { Button, Resizable, Tabs } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

/**
 * A result payload can be far larger than a fixed sidebar, so the reader sets
 * the split. The panel only joins the group while an action is selected, and
 * `order` keeps the remaining panel identified across that change.
 */
const AutomationExecutionDetailBody = () => {
  const { selectedAction } = useAutomationExecutionSelection();

  return (
    <Resizable.PanelGroup
      direction="horizontal"
      autoSaveId="automation-execution-detail"
      className="flex min-h-0 flex-1"
    >
      <Resizable.Panel order={1} minSize={30} className="flex min-w-0 flex-col">
        <Tabs.Content value="flow" className="flex-1 min-h-0">
          <AutomationHistoryFlow />
        </Tabs.Content>

        <Tabs.Content value="table" className="flex-1 min-h-0">
          <AutomationHistoryByTable />
        </Tabs.Content>
      </Resizable.Panel>

      {selectedAction && (
        <>
          <Resizable.Handle withHandle />
          <Resizable.Panel
            order={2}
            minSize={15}
            defaultSize={28}
            className="flex min-w-0"
          >
            <AutomationExecutionResultPanel />
          </Resizable.Panel>
        </>
      )}
    </Resizable.PanelGroup>
  );
};

export const AutomationExecutionBackButton = () => {
  const { t } = useTranslation('automations');
  const { canGoBack, backToParentExecution } = useAutomationHistoryDetail();

  if (!canGoBack) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={t('history-back-to-parent')}
      onClick={backToParentExecution}
    >
      <IconArrowLeft className="size-4" />
    </Button>
  );
};

export const useAutomationExecutionDetailTitle = () => {
  const { t } = useTranslation('automations');
  const { canGoBack } = useAutomationHistoryDetail();

  return canGoBack ? t('history-workflow-run') : t('history-execution-history');
};

const AutomationExecutionResultName = () => {
  const { executionDetail } = useAutomationExecutionDetail();

  if (!executionDetail) {
    return null;
  }

  return (
    <div>
      <AutomationHistoryResultName executionDetail={executionDetail} />
    </div>
  );
};

export const AutomationExecutionDetailTabs = ({
  // The campaign's recipient list opens straight on the flow, where "how far
  // did this get" is read off the steps themselves.
  defaultTab = 'table',
}: {
  defaultTab?: 'table' | 'flow';
}) => {
  const { t } = useTranslation('automations');
  const { error, refetch } = useAutomationExecutionDetail();

  if (error) {
    return (
      <AutomationErrorEmptyState
        title={t('history-load-run-error')}
        error={error}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <AutomationExecutionSelectionProvider>
      <Tabs defaultValue={defaultTab} className="h-full flex flex-col min-h-0">
        <div className="w-full flex flex-none items-center justify-between p-2 border-b">
          <Tabs.List variant="segment" className="h-8 p-0.5">
            <Tabs.Trigger
              value="table"
              className="h-7 gap-1.5 px-2.5 text-xs [&>svg]:size-3.5"
            >
              <IconAutomaticGearbox />
              {t('history-table')}
            </Tabs.Trigger>
            <Tabs.Trigger
              value="flow"
              className="h-7 gap-1.5 px-2.5 text-xs [&>svg]:size-3.5"
            >
              <IconTournament className="scale-x-[-1]" />
              {t('history-flow')}
            </Tabs.Trigger>
          </Tabs.List>
          <AutomationExecutionResultName />
        </div>

        <AutomationExecutionDetailBody />
      </Tabs>
    </AutomationExecutionSelectionProvider>
  );
};
