import type { ComponentType } from 'react';
import {
  PosCreatePanel,
  PosCreatePanelTitle,
} from '@/pos/components/pos-create/PosCreatePanel';
import {
  PosCategoryMappingPanel,
  PosCategoryMappingPanelTitle,
} from '@/pos/components/products/PosCategoryMappingPanel';
import {
  PosCardConfigPanel,
  PosCardConfigPanelTitle,
} from '@/pos/components/syncCard/PosCardConfigPanel';
import {
  POS_CARD_CONFIG_CONTENT_TYPE,
  POS_CATEGORY_MAPPING_CONTENT_TYPE,
  POS_COVER_CONTENT_TYPE,
  POS_CREATE_CONTENT_TYPE,
  POS_ORDER_CONTENT_TYPE,
  POS_PANEL_FIELDS_CLASS_NAME,
} from '@/pos/constants/posPanel';
import { usePosOrderQuery } from '@/pos/orders/detail/hooks/usePosOrderQuery';
import { cn, Skeleton } from 'erxes-ui';
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

const POS_FORM_PANELS: Record<
  string,
  { Title: ComponentType; Form: ComponentType }
> = {
  [POS_CREATE_CONTENT_TYPE]: {
    Title: PosCreatePanelTitle,
    Form: PosCreatePanel,
  },
  [POS_CARD_CONFIG_CONTENT_TYPE]: {
    Title: PosCardConfigPanelTitle,
    Form: PosCardConfigPanel,
  },
  [POS_CATEGORY_MAPPING_CONTENT_TYPE]: {
    Title: PosCategoryMappingPanelTitle,
    Form: PosCategoryMappingPanel,
  },
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

  const formPanel = POS_FORM_PANELS[contentType];

  if (formPanel) {
    if (view === 'title') return <formPanel.Title />;
    if (view !== 'new') return null;

    return (
      <div
        className={cn(
          'flex flex-1 min-h-0 flex-col',
          POS_PANEL_FIELDS_CLASS_NAME,
        )}
      >
        <formPanel.Form />
      </div>
    );
  }

  return null;
};
