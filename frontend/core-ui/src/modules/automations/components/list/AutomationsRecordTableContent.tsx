import { AutomationExecutionCountsLoader } from '@/automations/components/list/AutomationExecutionCountCell';
import { AutomationListRow } from '@/automations/components/list/AutomationListRow';
import { AutomationRecordTableCommandBar } from '@/automations/components/list/AutomationRecordTableCommandBar';
import { AutomationFolderChildrenLoader } from '@/automations/components/list/folders/AutomationFolderChildrenLoader';
import { useAutomationListTableOptions } from '@/automations/hooks/useAutomationListRows';
import {
  TAutomationListRow,
  TAutomationRecordTableColumnDefData,
} from '@/automations/types';
import { EnumCursorDirection, RecordTable } from 'erxes-ui';
import { ColumnDef } from '@tanstack/table-core';

type AutomationsRecordTableContentProps = {
  columns: ColumnDef<TAutomationRecordTableColumnDefData>[];
  rows: TAutomationListRow[];
  automationIds: string[];
  openFolderIds: string[];
  listLength: number;
  loading: boolean;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
  handleFetchMore: ({ direction }: { direction: EnumCursorDirection }) => void;
};

export const AutomationsRecordTableContent = ({
  columns,
  rows,
  automationIds,
  openFolderIds,
  listLength,
  loading,
  hasPreviousPage,
  hasNextPage,
  handleFetchMore,
}: AutomationsRecordTableContentProps) => {
  const tableOptions = useAutomationListTableOptions(rows, columns);

  return (
    <>
      <AutomationExecutionCountsLoader automationIds={automationIds} />
      {openFolderIds.map((folderId) => (
        <AutomationFolderChildrenLoader key={folderId} folderId={folderId} />
      ))}
      <RecordTable.Provider
        columns={columns}
        data={rows}
        stickyColumns={['more', 'checkbox', 'name']}
        className="m-3"
        tableOptions={tableOptions}
      >
        <RecordTable.CursorProvider
          hasPreviousPage={hasPreviousPage}
          hasNextPage={hasNextPage}
          dataLength={listLength}
          sessionKey="automations_cursor"
        >
          <RecordTable>
            <RecordTable.Header />
            <RecordTable.Body>
              <RecordTable.CursorBackwardSkeleton
                handleFetchMore={handleFetchMore}
              />
              {loading && <RecordTable.RowSkeleton rows={40} />}
              <RecordTable.RowList Row={AutomationListRow} />
              <RecordTable.CursorForwardSkeleton
                handleFetchMore={handleFetchMore}
              />
            </RecordTable.Body>
          </RecordTable>
        </RecordTable.CursorProvider>
        <AutomationRecordTableCommandBar />
      </RecordTable.Provider>
    </>
  );
};
