import { Empty, RecordTable, useQueryState } from 'erxes-ui';

import { DealsColumn } from '@/deals/boards/components/list/DealsColumn';
import { DealsCommandBar } from '@/deals/boards/components/list/DealsListCommandBar';
import { NoStagesWarning } from '@/deals/components/common/NoStagesWarning';
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

  if (pipelineId && !stagesLoading && stages.length === 0) {
    return <NoStagesWarning />;
  }

  if (pipelineId && !loading && (deals?.length ?? 0) === 0) {
    return <DealsEmptyState />;
  }

  return (
    <div className="flex flex-col overflow-hidden h-full relative">
      <RecordTable.Provider
        columns={columns}
        data={deals || (loading ? [{}] : [])}
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
