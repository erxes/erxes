import { RecordTable, useQueryState } from 'erxes-ui';

import { DealsColumn } from '@/deals/boards/components/list/DealsColumn';
import { DealsCommandBar } from '@/deals/boards/components/list/DealsListCommandBar';
import { NoStagesWarning } from '@/deals/components/common/NoStagesWarning';
import { useDeals } from '@/deals/cards/hooks/useDeals';
import { getDealsQueryVariables } from '@/deals/utils/queryVariables';
import { useSearchParams } from 'react-router-dom';
import { useStages } from '@/deals/stage/hooks/useStages';

export const DealsRecordTable = () => {
  const [pipelineId] = useQueryState<string | null>('pipelineId');
  const [searchParams] = useSearchParams();

  const { stages, loading: stagesLoading } = useStages({
    variables: {
      pipelineId,
    },
    skip: !pipelineId,
  });

  const archivedOnly = searchParams.get('archivedOnly') === 'true';
  const queryVariables = getDealsQueryVariables(searchParams);

  const { deals, loading, handleFetchMore } = useDeals({
    skip: !pipelineId,
    variables: {
      boardId: searchParams.get('boardId'),
      pipelineId,
      stageId: searchParams.get('stageId'),
      ...queryVariables,
    },
  });

  const filteredDeals = deals?.filter((deal) => {
    return archivedOnly
      ? deal.status === 'archived'
      : deal.status !== 'archived';
  });

  if (pipelineId && !stagesLoading && stages.length === 0) {
    return <NoStagesWarning />;
  }

  return (
    <div className="flex flex-col overflow-hidden h-full relative">
      <RecordTable.Provider
        columns={DealsColumn()}
        data={filteredDeals || (loading ? [{}] : [])}
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
