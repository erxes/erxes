import { automationHistoriesColumns } from '@/automations/components/builder/history/AutomationHistoryRecordTableColumns';
import { useAutomationHistories } from '@/automations/hooks/useAutomationHistories';
import { IconArchive, IconRefresh } from '@tabler/icons-react';
import { Button, Label, PageSubHeader, RecordTable, Skeleton } from 'erxes-ui';
import { AUTOMATION_HISTORIES_CURSOR_SESSION_KEY } from '@/automations/constants';
import { AutomationHistoriesRecordTableFilter } from '@/automations/components/builder/history/components/filters/AutomationRecordTableFilter';

export const AutomationHistories = () => {
  const {
    list,
    loading,
    totalCount,
    handleFetchMore,
    hasNextPage,
    hasPreviousPage,
    refetch,
  } = useAutomationHistories();

  return (
    <div className="flex flex-col flex-1 min-h-0">
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
      <div className="flex-1 overflow-auto">
        <RecordTable.Provider
          columns={automationHistoriesColumns}
          data={list}
          className="mt-1.5 flex-1 h-fit "
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
                {!totalCount && (
                  <tr className="h-[80vh]">
                    <td colSpan={6} className="py-10 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <IconArchive className="w-8 h-8 mb-2" />
                        <Label>No results</Label>
                      </div>
                    </td>
                  </tr>
                )}
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
    </div>
  );
};
