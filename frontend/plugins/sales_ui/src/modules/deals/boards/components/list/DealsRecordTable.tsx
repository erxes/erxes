import { Empty, RecordTable, useQueryState } from 'erxes-ui';

import { DealsColumn } from '@/deals/boards/components/list/DealsColumn';
import { DealLoyaltyTotalsProvider } from '@/deals/loyaltyRules/components/DealLoyaltyTotals';
import { BoardEmptyState } from '@/deals/boards/components/BoardEmptyState';
import { DealsCommandBar } from '@/deals/boards/components/list/DealsListCommandBar';
import { NoStagesWarning } from '@/deals/components/common/NoStagesWarning';
import { PipelineEmptyState } from '@/deals/pipelines/components/PipelineEmptyState';
import { useBoards } from '@/deals/boards/hooks/useBoards';
import { useDeals } from '@/deals/cards/hooks/useDeals';
import { getDealsQueryVariables } from '@/deals/utils/queryVariables';
import { useSearchParams } from 'react-router-dom';
import { useStages } from '@/deals/stage/hooks/useStages';
import { IconBriefcaseOff } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

const DealsEmptyState = () => {
  const { t } = useTranslation('sales');

  return (
    <Empty className="h-full border-0 bg-transparent">
      <Empty.Header>
        <Empty.Media variant="icon">
          <IconBriefcaseOff />
        </Empty.Media>
        <Empty.Title>{t('no-deals-found')}</Empty.Title>
        <Empty.Description>{t('no-deals-to-display')}</Empty.Description>
      </Empty.Header>
    </Empty>
  );
};

export const DealsRecordTable = () => {
  const [boardId] = useQueryState<string>('boardId');
  const { boards, loading: boardsLoading, error: boardsError } = useBoards();
  const board = boards?.find((item) => item._id === boardId);
  const [pipelineId] = useQueryState<string | null>('pipelineId');
  const [searchParams] = useSearchParams();
  const columns = DealsColumn();

  const { stages, loading: stagesLoading } = useStages({
    variables: {
      pipelineId,
    },
    skip: !pipelineId,
  });

  const queryVariables = getDealsQueryVariables(searchParams);
  const { deals, loading, handleFetchMore, pageInfo } = useDeals({
    skip: !pipelineId,
    variables: {
      pipelineId,
      stageId: searchParams.get('stageId'),
      ...queryVariables,
    },
  });
  const { hasPreviousPage, hasNextPage } = pageInfo || {};

  const isLoading = boardsLoading || loading || !pipelineId;

  if (!boardsLoading && !boardsError && boards && !board) {
    return <BoardEmptyState hasBoards={boards.length > 0} />;
  }

  if (
    !boardsLoading &&
    !boardsError &&
    board &&
    !(board.pipelines || []).some((pipeline) => pipeline.status !== 'archived')
  ) {
    return <PipelineEmptyState boardId={board._id} />;
  }

  if (pipelineId && !boardsLoading && !stagesLoading && stages.length === 0) {
    return <NoStagesWarning />;
  }

  if (pipelineId && !isLoading && (deals?.length ?? 0) === 0) {
    return <DealsEmptyState />;
  }

  return (
    <DealLoyaltyTotalsProvider dealIds={(deals || []).map(({ _id }) => _id)}>
      <div className="flex flex-col overflow-hidden h-full relative">
        <RecordTable.Provider
          columns={columns}
          data={deals || []}
          className="m-3 h-full"
          stickyColumns={['more', 'checkbox', 'name']}
          tableId="sales_deals_record_table"
        >
          <RecordTable.CursorProvider
            dataLength={deals?.length}
            hasPreviousPage={hasPreviousPage}
            hasNextPage={hasNextPage}
          >
            <RecordTable>
              <RecordTable.Header />
              <RecordTable.Body>
                <RecordTable.CursorBackwardSkeleton
                  handleFetchMore={handleFetchMore}
                />
                {isLoading && <RecordTable.RowSkeleton rows={40} />}
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
    </DealLoyaltyTotalsProvider>
  );
};
