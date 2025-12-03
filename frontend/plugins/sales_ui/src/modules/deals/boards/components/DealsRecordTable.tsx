import { DealsColumn } from '@/deals/boards/components/DealsColumn';
import { RecordTable, useQueryState } from 'erxes-ui';
import { useDeals } from '@/deals/cards/hooks/useDeals';
import { DealsCommandBar } from '@/deals/actionBar/components/DealsListCommandBar';

export const DealsRecordTable = () => {
  const [pipelineId] = useQueryState<string | null>('pipelineId');

  const { deals, loading, handleFetchMore } = useDeals({
    skip: !pipelineId,
    variables: {
      pipelineId,
    },
  });

  return (
    <div className="flex flex-col overflow-hidden h-full relative">
      <RecordTable.Provider
        columns={DealsColumn()}
        data={deals || (loading ? [{}] : [])}
        className="m-3 h-full"
        stickyColumns={['checkbox', 'name']}
      >
        <RecordTable.CursorProvider dataLength={deals?.length}>
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
          <DealsCommandBar />
        </RecordTable.CursorProvider>
      </RecordTable.Provider>
    </div>
  );
};
