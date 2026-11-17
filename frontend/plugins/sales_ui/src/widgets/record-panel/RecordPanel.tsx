import type { ComponentType } from 'react';
import { DealActivityTab } from '@/deals/cards/components/detail/DealActivityTab';
import { DealPipelineProperties } from '@/deals/cards/components/detail/DealPipelineProperties';
import { Products } from '@/deals/cards/components/detail/product/components/Products';
import { useDealDetail } from '@/deals/cards/hooks/useDeals';
import { useDealCustomFieldEdit } from '@/deals/cards/hooks/useDealCustomFieldEdit';
import { DealsProvider } from '@/deals/context/DealContext';
import { DealIdProvider } from '@/deals/context/DealIdContext';
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
import { cn, ScrollArea, Skeleton } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { NEW_RECORD_ID, type IRecordPanelProps } from 'ui-modules';
import { DealConnectionPanel } from '~/widgets/contact/DealConnectionPanel';
import { DEAL_CONNECTION_CONTENT_TYPE } from '~/widgets/contact/dealContactConnection';
import { DealPanelActions } from '~/widgets/record-panel/DealPanelActions';
import { DealPanelDetail } from '~/widgets/record-panel/DealPanelDetail';
import { DealPanelNew } from '~/widgets/record-panel/DealPanelNew';
import { DealPanelRelations } from '~/widgets/record-panel/DealPanelRelations';
import { DealPanelSummary } from '~/widgets/record-panel/DealPanelStage';
import { useDealPanelTabMemory } from '~/widgets/record-panel/useDealPanelTabMemory';
import { DealPanelLoader } from '~/widgets/record-panel/DealPanelStates';
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
  const { deal, loading, error } = useDealDetail(
    { variables: { _id: dealId } },
    { subscribe },
  );

  if (loading && !deal) {
    return <Skeleton className="h-4 w-32" />;
  }

  if (error && !deal) {
    return <span className="text-destructive">{t('failed-to-load-deal')}</span>;
  }

  return deal?.name || t('untitled');
};

export const DealPanelProperties = ({ dealId }: { dealId: string }) => (
  <DealPanelLoader dealId={dealId}>
    {(deal) => (
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
    )}
  </DealPanelLoader>
);

export const DealPanelProductsTab = ({
  dealId,
  compact = true,
}: {
  dealId: string;
  compact?: boolean;
}) => (
  <DealPanelLoader dealId={dealId}>
    {(deal, refetch) => (
      <DealsProvider>
        <div className="flex flex-1 min-h-0 flex-col p-3">
          <Products deal={deal} refetch={refetch} compact={compact} />
        </div>
      </DealsProvider>
    )}
  </DealPanelLoader>
);

const DealPanelHeaderTitle = ({ dealId }: { dealId: string }) => {
  useDealPanelTabMemory();

  return <DealPanelTitle dealId={dealId} />;
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

  if (view === 'tab' && tab === 'relations') {
    return <DealPanelRelations dealId={dealId} />;
  }

  if (view === 'title') {
    return dealId === NEW_RECORD_ID ? (
      <DealPanelTitle dealId={dealId} />
    ) : (
      <DealPanelHeaderTitle dealId={dealId} />
    );
  }

  if (view === 'actions') {
    return <DealPanelActions dealId={dealId} />;
  }

  if (view === 'summary') {
    return <DealPanelSummary dealId={dealId} />;
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

const DealConnectionTitle = () => {
  const { t } = useTranslation('sales');

  return t('connect-deal', 'Connect deal');
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
  if (contentType === DEAL_CONNECTION_CONTENT_TYPE) {
    if (view === 'title') return <DealConnectionTitle />;
    return view === 'new' ? <DealConnectionPanel /> : null;
  }

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
