import { DealActivityTab } from '@/deals/cards/components/detail/DealActivityTab';
import { DealPipelineProperties } from '@/deals/cards/components/detail/DealPipelineProperties';
import { Products } from '@/deals/cards/components/detail/product/components/Products';
import { useDealDetail } from '@/deals/cards/hooks/useDeals';
import { useDealCustomFieldEdit } from '@/deals/cards/hooks/useDealCustomFieldEdit';
import { DealsProvider } from '@/deals/context/DealContext';
import { DealIdProvider } from '@/deals/context/DealIdContext';
import {
  POS_COVER_CONTENT_TYPE,
  POS_ORDER_CONTENT_TYPE,
} from '@/pos/constants/posPanel';
import { usePosOrderQuery } from '@/pos/orders/detail/hooks/usePosOrderQuery';
import { ScrollArea, Skeleton, Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import type { IRecordPanelProps } from 'ui-modules';
import { DealPanelActions } from '~/widgets/record-panel/DealPanelActions';
import { DealPanelDetail } from '~/widgets/record-panel/DealPanelDetail';
import { DealPanelNew } from '~/widgets/record-panel/DealPanelNew';
import {
  DealPanelError,
  DealPanelNotFound,
} from '~/widgets/record-panel/DealPanelStates';
import {
  PosCoverPanelActions,
  PosCoverPanelDetail,
  PosCoverPanelTitle,
} from '~/widgets/record-panel/PosCoverPanel';
import {
  PosOrderPanelDetail,
  PosOrderPanelPayments,
} from '~/widgets/record-panel/PosOrderPanelDetail';
import { PosPanelActivity } from '~/widgets/record-panel/PosPanelShared';

const DEAL_CONTENT_TYPE = 'sales:deal';

export const DealPanelTitle = ({
  dealId,
  subscribe = true,
}: {
  dealId: string;
  subscribe?: boolean;
}) => {
  const { t } = useTranslation('sales');
  const { deal, loading } = useDealDetail(
    { variables: { _id: dealId } },
    { subscribe },
  );

  if (loading && !deal) {
    return <Skeleton className="h-4 w-32" />;
  }

  return deal?.name || t('untitled');
};

export const DealPanelProperties = ({ dealId }: { dealId: string }) => {
  const { deal, loading, error } = useDealDetail(
    { variables: { _id: dealId }, fetchPolicy: 'cache-first' },
    { subscribe: false },
  );

  if (loading && !deal) {
    return <Spinner containerClassName="py-12" />;
  }

  if (error && !deal) {
    return <DealPanelError error={error} />;
  }

  if (!deal) {
    return <DealPanelNotFound />;
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

export const DealPanelProductsTab = ({
  dealId,
  compact = true,
}: {
  dealId: string;
  compact?: boolean;
}) => {
  const { deal, loading, error, refetch } = useDealDetail(
    { variables: { _id: dealId }, fetchPolicy: 'cache-first' },
    { subscribe: false },
  );

  if (loading && !deal) {
    return <Spinner containerClassName="py-12" />;
  }

  if (error && !deal) {
    return <DealPanelError error={error} />;
  }

  if (!deal) {
    return <DealPanelNotFound />;
  }

  return (
    <DealsProvider>
      <div className="flex flex-1 min-h-0 flex-col p-3">
        <Products deal={deal} refetch={refetch} compact={compact} />
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

export const PosOrderPanelTitle = ({ orderId }: { orderId: string }) => {
  const { t } = useTranslation('sales');
  const { posOrder, loading } = usePosOrderQuery(orderId);

  if (loading && !posOrder) {
    return <Skeleton className="h-4 w-32" />;
  }

  return posOrder?.number ? `#${posOrder.number}` : t('order-detail');
};

const renderPosOrderView = (
  orderId: string,
  view: IRecordPanelProps['view'],
  tab?: string,
) => {
  if (view === 'title') {
    return <PosOrderPanelTitle orderId={orderId} />;
  }

  if (view === 'detail') {
    return <PosOrderPanelDetail orderId={orderId} />;
  }

  if (view === 'tab' && tab === 'payments') {
    return <PosOrderPanelPayments orderId={orderId} />;
  }

  if (view === 'activity') {
    return <PosPanelActivity contentId={orderId} />;
  }

  return null;
};

const renderPosCoverView = (
  coverId: string,
  view: IRecordPanelProps['view'],
) => {
  if (view === 'title') {
    return <PosCoverPanelTitle coverId={coverId} />;
  }

  if (view === 'actions') {
    return <PosCoverPanelActions coverId={coverId} />;
  }

  if (view === 'detail') {
    return <PosCoverPanelDetail coverId={coverId} />;
  }

  if (view === 'activity') {
    return <PosPanelActivity contentId={coverId} />;
  }

  return null;
};

export const RecordPanel = ({
  contentType,
  contentId,
  view,
  tab,
}: IRecordPanelProps) => {
  if (contentType === POS_ORDER_CONTENT_TYPE) {
    return renderPosOrderView(contentId, view, tab);
  }

  if (contentType === POS_COVER_CONTENT_TYPE) {
    return renderPosCoverView(contentId, view);
  }

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
