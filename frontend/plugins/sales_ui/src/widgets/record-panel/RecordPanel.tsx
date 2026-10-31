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
import { PosOrderPanelDetail } from '~/widgets/record-panel/PosOrderPanelDetail';
import { PosPanelActivity } from '~/widgets/record-panel/PosPanelShared';

const PosOrderPanelTitle = ({ orderId }: { orderId: string }) => {
  const { t } = useTranslation('sales');
  const { posOrder, loading } = usePosOrderQuery(orderId);

  if (loading && !posOrder) {
    return <Skeleton className="h-4 w-32" />;
  }

  return posOrder?.number ? `#${posOrder.number}` : t('order-detail');
};

export const RecordPanel = ({
  contentType,
  contentId,
  view,
}: IRecordPanelProps) => {
  if (contentType === POS_ORDER_CONTENT_TYPE) {
    if (view === 'title') {
      return <PosOrderPanelTitle orderId={contentId} />;
    }

    if (view === 'detail') {
      return <PosOrderPanelDetail orderId={contentId} />;
    }
  }

  if (contentType === POS_COVER_CONTENT_TYPE) {
    if (view === 'title') {
      return <PosCoverPanelTitle coverId={contentId} />;
    }

    if (view === 'actions') {
      return <PosCoverPanelActions coverId={contentId} />;
    }

    if (view === 'detail') {
      return <PosCoverPanelDetail coverId={contentId} />;
    }
  }

  if (
    view === 'activity' &&
    [POS_ORDER_CONTENT_TYPE, POS_COVER_CONTENT_TYPE].includes(contentType)
  ) {
    return <PosPanelActivity contentId={contentId} />;
  }

  return null;
};
