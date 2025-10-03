import { automationHistoriesColumns } from '@/automations/components/builder/history/AutomtionHistoryRecorTableColumns';
import { useAutomationHistories } from '@/automations/hooks/useAutomationHistories';
import { IconRefresh } from '@tabler/icons-react';
import { Button, PageSubHeader, RecordTable, Skeleton } from 'erxes-ui';
import { AutomationHistoriesRecordTableFilter } from './filters/AutomationRecordTableFilter';
import { AUTOMATION_HISTORIES_CURSOR_SESSION_KEY } from '@/automations/constants';

export const AutomationHistories = () => {
  const {
    list,
    loading,
    totalCount,
    triggersConst,
    actionsConst,
    handleFetchMore,
    hasNextPage,
    hasPreviousPage,
    refetch,
  } = useAutomationHistories();

  return (
    <>
      <PageSubHeader>
        <AutomationHistoriesRecordTableFilter />
        <div className="text-muted-foreground font-medium text-sm whitespace-nowrap h-7 leading-7">
          {totalCount
            ? `${totalCount} records found`
            : loading && <Skeleton className="w-20 h-4 inline-block mt-1.5" />}
        </div>
        <Button variant="ghost" disabled={loading} onClick={() => refetch()}>
          <IconRefresh />
        </Button>
      </PageSubHeader>
      <div className="flex-1">
        <RecordTable.Provider
          columns={automationHistoriesColumns({ triggersConst, actionsConst })}
          data={list}
          className="mt-1.5 h-full overflow-auto"
          stickyColumns={['more']}
        >
          <RecordTable.CursorProvider
            hasPreviousPage={hasPreviousPage}
            hasNextPage={hasNextPage}
            dataLength={list?.length}
            sessionKey={AUTOMATION_HISTORIES_CURSOR_SESSION_KEY}
          >
            <RecordTable className="w-full">
              <RecordTable.Header />
              <RecordTable.Body>
                <RecordTable.CursorBackwardSkeleton
                  handleFetchMore={handleFetchMore}
                />
                {loading && <RecordTable.RowSkeleton rows={40} />}
                <RecordTable.RowList />
                <RecordTable.CursorForwardSkeleton
                  handleFetchMore={handleFetchMore}
                />
              </RecordTable.Body>
            </RecordTable>
          </RecordTable.CursorProvider>
        </RecordTable.Provider>
      </div>
    </>
  );
};
