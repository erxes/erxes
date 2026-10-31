import { DealActivityTab } from '@/deals/cards/components/detail/DealActivityTab';
import { DealPipelineProperties } from '@/deals/cards/components/detail/DealPipelineProperties';
import { Products } from '@/deals/cards/components/detail/product/components/Products';
import { useDealDetail } from '@/deals/cards/hooks/useDeals';
import { useDealCustomFieldEdit } from '@/deals/cards/hooks/useDealCustomFieldEdit';
import { DealsProvider } from '@/deals/context/DealContext';
import { DealIdProvider } from '@/deals/context/DealIdContext';
import { ScrollArea, Skeleton, Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import type { IRecordPanelProps } from 'ui-modules';
import { DealPanelActions } from '~/widgets/record-panel/DealPanelActions';
import { DealPanelDetail } from '~/widgets/record-panel/DealPanelDetail';
import { DealPanelNew } from '~/widgets/record-panel/DealPanelNew';

const DEAL_CONTENT_TYPE = 'sales:deal';

const DealPanelTitle = ({ dealId }: { dealId: string }) => {
  const { t } = useTranslation('sales');
  const { deal, loading } = useDealDetail({ variables: { _id: dealId } });

  if (loading && !deal) {
    return <Skeleton className="h-4 w-32" />;
  }

  return deal?.name || t('untitled');
};

const DealPanelProperties = ({ dealId }: { dealId: string }) => {
  const { deal, loading } = useDealDetail(
    { variables: { _id: dealId }, fetchPolicy: 'cache-first' },
    { subscribe: false },
  );

  if (loading && !deal) {
    return <Spinner containerClassName="py-12" />;
  }

  if (!deal) {
    return null;
  }

  return (
    <ScrollArea className="flex-1 min-h-0">
      <div className="p-3">
        <DealPipelineProperties
          key={`${deal._id}-${JSON.stringify(deal.propertiesData || {})}`}
          id={deal._id}
          pipelineId={deal.pipelineId || ''}
          propertiesData={deal.propertiesData || {}}
          mutateHook={useDealCustomFieldEdit}
        />
      </div>
    </ScrollArea>
  );
};

const DealPanelProductsTab = ({ dealId }: { dealId: string }) => {
  const { deal, loading, refetch } = useDealDetail(
    { variables: { _id: dealId }, fetchPolicy: 'cache-first' },
    { subscribe: false },
  );

  if (loading && !deal) {
    return <Spinner containerClassName="py-12" />;
  }

  if (!deal) {
    return null;
  }

  return (
    <DealsProvider>
      <div className="flex flex-1 min-h-0 flex-col p-3">
        <Products deal={deal} refetch={refetch} compact />
      </div>
    </DealsProvider>
  );
};

const DealPanelView = ({
  dealId,
  view,
  tab,
}: {
  dealId: string;
  view: IRecordPanelProps['view'];
  tab?: string;
}) => {
  if (view === 'tab' && tab === 'products') {
    return <DealPanelProductsTab dealId={dealId} />;
  }

  if (view === 'title') {
    return <DealPanelTitle dealId={dealId} />;
  }

  if (view === 'actions') {
    return <DealPanelActions dealId={dealId} />;
  }

  if (view === 'properties') {
    return <DealPanelProperties dealId={dealId} />;
  }

  if (view === 'activity') {
    return <DealActivityTab dealId={dealId} />;
  }

  if (view === 'detail') {
    return <DealPanelDetail dealId={dealId} />;
  }

  return null;
};

export const RecordPanel = ({
  contentType,
  contentId,
  view,
  tab,
}: IRecordPanelProps) => {
  if (contentType !== DEAL_CONTENT_TYPE) {
    return null;
  }

  if (view === 'new') {
    return <DealPanelNew />;
  }

  return (
    <DealIdProvider value={contentId}>
      <DealPanelView dealId={contentId} view={view} tab={tab} />
    </DealIdProvider>
  );
};
