import { automationHistoriesColumns } from '@/automations/components/builder/history/AutomationHistoryRecordTableColumns';
import { useAutomationHistories } from '@/automations/hooks/useAutomationHistories';
import { IconArchive, IconRefresh } from '@tabler/icons-react';
import {
  Button,
  Label,
  PageSubHeader,
  RecordTable,
  Resizable,
  Skeleton,
} from 'erxes-ui';
import { AUTOMATION_HISTORIES_CURSOR_SESSION_KEY } from '@/automations/constants';
import { AutomationHistoriesRecordTableFilter } from '@/automations/components/builder/history/components/filters/AutomationRecordTableFilter';
import { AutomationHistorySplitPanel } from '@/automations/components/builder/history/components/AutomationHistorySplitPanel';
import { AutomationHistoryViewModeToggle } from '@/automations/components/builder/history/components/AutomationHistoryViewOptions';
import { useAutomationHistoryView } from '@/automations/components/builder/history/hooks/useAutomationHistoryView';
import { useTranslation } from 'react-i18next';

type AutomationHistoriesTableProps = Omit<
  ReturnType<typeof useAutomationHistories>,
  'refetch'
>;

// Reuses the record table's own selected-row styling for the row shown in the
// split panel.
const AutomationHistoryRow = ({
  original,
  ...props
}: React.ComponentProps<typeof RecordTable.Row>) => {
  const { selectedExecutionId } = useAutomationHistoryView();
  const isSelected =
    !!selectedExecutionId && original?._id === selectedExecutionId;

  return (
    <RecordTable.Row
      {...props}
      original={original}
      {...(isSelected ? { 'data-state': 'selected' } : {})}
    />
  );
};

const AutomationHistoriesTable = ({
  list,
  loading,
  totalCount,
  handleFetchMore,
  hasNextPage,
  hasPreviousPage,
}: AutomationHistoriesTableProps) => {
  const { t } = useTranslation('automations');

  return (
    <div className="flex-1 min-h-0 pt-1.5">
      <RecordTable.Provider
        columns={automationHistoriesColumns}
        data={list}
        className="h-full min-h-0"
        stickyColumns={['more']}
      >
        <RecordTable.CursorProvider
          hasPreviousPage={hasPreviousPage}
          hasNextPage={hasNextPage}
          dataLength={list?.length}
          sessionKey={AUTOMATION_HISTORIES_CURSOR_SESSION_KEY}
        >
          <RecordTable>
            <RecordTable.Header />
            <RecordTable.Body>
              <RecordTable.CursorBackwardSkeleton
                handleFetchMore={handleFetchMore}
              />
              {!totalCount && (
                <tr className="h-[80vh]">
                  <td colSpan={6} className="py-10 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <IconArchive className="w-8 h-8 mb-2" />
                      <Label>{t('no-results')}</Label>
                    </div>
                  </td>
                </tr>
              )}
              {loading && <RecordTable.RowSkeleton rows={40} />}
              <RecordTable.RowList Row={AutomationHistoryRow} />
              <RecordTable.CursorForwardSkeleton
                handleFetchMore={handleFetchMore}
              />
            </RecordTable.Body>
          </RecordTable>
        </RecordTable.CursorProvider>
      </RecordTable.Provider>
    </div>
  );
};

export const AutomationHistories = () => {
  const { refetch, ...tableProps } = useAutomationHistories();
  const { loading, totalCount } = tableProps;
  const { isSplitView, isVerticalSplit, splitDirection, selectedExecutionId } =
    useAutomationHistoryView();
  const { t } = useTranslation('automations');

  const isSplitOpen = isSplitView && !!selectedExecutionId;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <PageSubHeader>
        <AutomationHistoriesRecordTableFilter />
        <div className="text-muted-foreground font-medium text-sm whitespace-nowrap h-7 leading-7">
          {totalCount
            ? t('records-found', { count: totalCount })
            : loading && <Skeleton className="w-20 h-4 inline-block mt-1.5" />}
        </div>
        <Button variant="ghost" disabled={loading} onClick={() => refetch()}>
          <IconRefresh />
        </Button>
        <AutomationHistoryViewModeToggle />
      </PageSubHeader>
      {isSplitOpen ? (
        <Resizable.PanelGroup
          key={splitDirection}
          direction={splitDirection}
          autoSaveId={`automation-history-split-${splitDirection}`}
          className="flex-1 min-h-0"
        >
          <Resizable.Panel
            minSize={20}
            defaultSize={isVerticalSplit ? 55 : 60}
            className="flex flex-col min-h-0"
          >
            <AutomationHistoriesTable {...tableProps} />
          </Resizable.Panel>
          <Resizable.Handle withHandle />
          <Resizable.Panel
            minSize={20}
            defaultSize={isVerticalSplit ? 45 : 40}
            className="flex flex-col min-h-0"
          >
            <AutomationHistorySplitPanel executionId={selectedExecutionId} />
          </Resizable.Panel>
        </Resizable.PanelGroup>
      ) : (
        <AutomationHistoriesTable {...tableProps} />
      )}
    </div>
  );
};
