import { Empty, RecordTable, useQueryState } from 'erxes-ui';

import { DealsColumn } from '@/deals/boards/components/list/DealsColumn';
import { DealsCommandBar } from '@/deals/boards/components/list/DealsListCommandBar';
import { useDeals } from '@/deals/cards/hooks/useDeals';
import { getDealsQueryVariables } from '@/deals/utils/queryVariables';
import { useSearchParams } from 'react-router-dom';
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

  if (pipelineId && !loading && (filteredDeals?.length ?? 0) === 0) {
    return <DealsEmptyState />;
  }

  return (
    <div className="flex flex-col overflow-hidden h-full relative">
      <RecordTable.Provider
        columns={columns}
        data={filteredDeals || (loading ? [{}] : [])}
        className="m-3 h-full"
        stickyColumns={['more', 'checkbox', 'name']}
        tableId="sales_deals_record_table"
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
