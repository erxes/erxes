import { DealsColumn } from '@/deals/boards/components/DealsColumn';
import { RecordTable, useQueryState } from 'erxes-ui';
import { useDeals } from '@/deals/cards/hooks/useDeals';
import { DealsCommandBar } from '@/deals/actionBar/components/DealsListCommandBar';
import { useSearchParams } from 'react-router-dom';
import { useStages } from '@/deals/stage/hooks/useStages';
import { NoStagesWarning } from '@/deals/components/common/NoStagesWarning';

export const DealsRecordTable = () => {
  const [pipelineId] = useQueryState<string | null>('pipelineId');
  const [searchParams] = useSearchParams();

  const { stages, loading: stagesLoading } = useStages({
    variables: {
      pipelineId,
    },
    skip: !pipelineId,
  });

  const ignoredKeys = ['boardId', 'pipelineId', 'salesItemId', 'tab'];

  const queryVariables: Record<string, any> = {};

  for (const [key, value] of searchParams.entries()) {
    if (ignoredKeys.includes(key)) continue;

    try {
      const parsed = JSON.parse(value);
      queryVariables[key] = parsed;
    } catch {
      queryVariables[key] = value;
    }
  }

  const archivedOnly = searchParams.get('archivedOnly') === 'true';

  if (archivedOnly) {
    queryVariables.noSkipArchive = true;
  }

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
