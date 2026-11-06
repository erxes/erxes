import {
  POS_COVER_CONTENT_TYPE,
  POS_ORDER_CONTENT_TYPE,
} from '@/pos/constants/posPanel';
import { usePosOrderQuery } from '@/pos/orders/detail/hooks/usePosOrderQuery';
import { Skeleton } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import type { IRecordPanelProps } from 'ui-modules';
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

  return null;
};
