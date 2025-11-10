import { RecordTable } from 'erxes-ui';
import { PosSummaryColumns } from './PosSummaryColumns';
import { PosSummaryCommandBar } from '@/pos/pos-summary/components/pos-summary-command-bar/PosSummaryCommandBar';
import { usePosSummaryList } from '~/modules/pos/pos-summary/hooks/UsePosSummaryList';

export const PosSummaryRecordTable = ({ posId }: { posId?: string }) => {
  const { posSummaryList, handleFetchMore, loading, pageInfo } =
    usePosSummaryList({ posId });

  return (
    <RecordTable.Provider
      columns={PosSummaryColumns}
      data={posSummaryList}
      className="m-3"
      stickyColumns={['more', 'checkbox', 'name']}
    >
      <RecordTable.CursorProvider
        hasPreviousPage={pageInfo?.hasPreviousPage}
        hasNextPage={pageInfo?.hasNextPage}
        dataLength={posSummaryList?.length}
        sessionKey="posSummary_cursor"
      >
        <RecordTable>
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
      <PosSummaryCommandBar />
    </RecordTable.Provider>
  );
};
