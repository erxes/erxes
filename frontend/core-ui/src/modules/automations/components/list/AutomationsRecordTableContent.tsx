import { AutomationRecordTableCommandBar } from '@/automations/components/list/AutomationRecordTableCommandBar';
import {
  IAutomation,
  TAutomationRecordTableColumnDefData,
} from '@/automations/types';
import { EnumCursorDirection, RecordTable } from 'erxes-ui';
import { ColumnDef } from '@tanstack/table-core';

type AutomationsRecordTableContentProps = {
  columns: ColumnDef<TAutomationRecordTableColumnDefData>[];
  list: IAutomation[];
  loading: boolean;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
  handleFetchMore: ({
    direction,
  }: {
    direction: EnumCursorDirection;
  }) => void;
};

export const AutomationsRecordTableContent = ({
  columns,
  list,
  loading,
  hasPreviousPage,
  hasNextPage,
  handleFetchMore,
}: AutomationsRecordTableContentProps) => {
  return (
    <RecordTable.Provider
      columns={columns}
      data={list}
      stickyColumns={['more', 'checkbox', 'name']}
      className="m-3"
    >
      <RecordTable.CursorProvider
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        dataLength={list.length}
        sessionKey="automations_cursor"
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
      <AutomationRecordTableCommandBar />
    </RecordTable.Provider>
  );
};
