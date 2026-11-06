import {
  IconHistory,
  IconHierarchy2,
  IconId,
  IconPackage,
  IconSandbox,
} from '@tabler/icons-react';
import {
  Breadcrumb,
  Button,
  PageContainer,
  Separator,
  Spinner,
  TextOverflowTooltip,
  useQueryState,
} from 'erxes-ui';
import { type ReactNode, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  type ISidePanelNavigator,
  PageHeader,
  RecordSidePanel,
  SidePanelNavigatorContext,
  useSidePanel,
} from 'ui-modules';
import { DealActivityTab } from '@/deals/cards/components/detail/DealActivityTab';
import { useDealDetail } from '@/deals/cards/hooks/useDeals';
import { DealIdProvider } from '@/deals/context/DealIdContext';
import { DealPanelActions } from '~/widgets/record-panel/DealPanelActions';
import { DealPanelDetail } from '~/widgets/record-panel/DealPanelDetail';
import {
  DealPanelProductsTab,
  DealPanelProperties,
  DealPanelTitle,
} from '~/widgets/record-panel/RecordPanel';
import {
  DealPanelError,
  DealPanelNotFound,
} from '~/widgets/record-panel/DealPanelStates';

const DETAIL_TAB = 'detail';
const PRODUCTS_TAB = 'products';
const PROPERTIES_TAB = 'properties';
const ACTIVITY_TAB = 'activity';
const DEAL_CONTENT_TYPE = 'sales:deal';

const useDealBoardPath = (dealId: string) => {
  const { deal } = useDealDetail(
    { variables: { _id: dealId }, fetchPolicy: 'cache-first' },
    { subscribe: false },
  );
  const lastPathRef = useRef('/sales/deals');
  const boardId = deal?.pipeline?.boardId || deal?.boardId;
  const pipelineId = deal?.pipeline?._id || deal?.pipelineId;

  if (boardId) {
    const params = new URLSearchParams({ boardId });

    if (pipelineId) params.set('pipelineId', pipelineId);
    lastPathRef.current = `/sales/deals?${params.toString()}`;
  }

  return { deal, boardPath: lastPathRef.current };
};

const DealPageBreadcrumb = ({ dealId }: { dealId: string }) => {
  const { t } = useTranslation('sales');
  const { deal, boardPath } = useDealBoardPath(dealId);

  return (
    <Breadcrumb className="min-w-0">
      <Breadcrumb.List className="gap-1 flex-nowrap min-w-0">
        <Breadcrumb.Item className="shrink-0">
          <Button variant="ghost" asChild>
            <Link to={boardPath}>
              <IconSandbox />
              {t('sales-pipeline')}
            </Link>
          </Button>
        </Breadcrumb.Item>
        {deal && (
          <>
            <Separator.Inline />
            <Breadcrumb.Item className="min-w-0">
              <Breadcrumb.Page className="min-w-0 px-2 text-sm">
                <TextOverflowTooltip value={deal.name || t('untitled')} />
              </Breadcrumb.Page>
            </Breadcrumb.Item>
          </>
        )}
      </Breadcrumb.List>
    </Breadcrumb>
  );
};

const DealPageTabs = ({ dealId }: { dealId: string }) => {
  const { t } = useTranslation('common', { keyPrefix: 'side-panel' });
  const { t: tSales } = useTranslation('sales');
  const [tab, setTab] = useQueryState<string>('tab');

  return (
    <RecordSidePanel.Tabs
      key={dealId}
      value={tab ?? PRODUCTS_TAB}
      onValueChange={setTab}
      visibleCount={3}
      overviewTab={DETAIL_TAB}
      expandedDefaultTab={PRODUCTS_TAB}
      overviewHeader={
        <div className="min-w-0 flex-1 truncate text-sm">
          <DealPanelTitle dealId={dealId} subscribe={false} />
        </div>
      }
      tabs={[
        {
          value: DETAIL_TAB,
          label: t('detail'),
          icon: IconId,
          content: (
            <div className="@container/record-panel flex min-h-0 flex-1 flex-col">
              <DealPanelDetail dealId={dealId} />
            </div>
          ),
        },
        {
          value: PRODUCTS_TAB,
          label: tSales('products'),
          icon: IconPackage,
          content: <DealPanelProductsTab dealId={dealId} compact={false} />,
        },
        {
          value: PROPERTIES_TAB,
          label: t('properties'),
          icon: IconHierarchy2,
          content: <DealPanelProperties dealId={dealId} />,
        },
        {
          value: ACTIVITY_TAB,
          label: t('activity'),
          icon: IconHistory,
          content: <DealActivityTab dealId={dealId} />,
        },
      ]}
    />
  );
};

const DealPageBody = ({ dealId }: { dealId: string }) => {
  const { deal, loading, error } = useDealDetail({
    variables: { _id: dealId },
  });

  if (loading && !deal) {
    return <Spinner containerClassName="py-12" />;
  }

  if (error && !deal) {
    return <DealPanelError error={error} />;
  }

  if (!deal) {
    return <DealPanelNotFound />;
  }

  return <DealPageTabs dealId={dealId} />;
};

const DealPageNavigator = ({
  dealId,
  children,
}: {
  dealId: string;
  children: ReactNode;
}) => {
  const navigate = useNavigate();
  const { openRecord } = useSidePanel();
  const [tab, setTab] = useQueryState<string>('tab');
  const { boardPath } = useDealBoardPath(dealId);
  const record = useMemo(
    () => ({ contentType: DEAL_CONTENT_TYPE, contentId: dealId }),
    [dealId],
  );

  const backToBoard = () => navigate(boardPath, { replace: true });

  const navigator: ISidePanelNavigator = {
    record,
    tab: tab ?? '',
    setTab,
    openRecord,
    back: backToBoard,
    canGoBack: false,
    close: backToBoard,
  };

  return (
    <SidePanelNavigatorContext.Provider value={navigator}>
      {children}
    </SidePanelNavigatorContext.Provider>
  );
};

export const DealDetailPage = () => {
  const { dealId } = useParams<{ dealId: string }>();

  if (!dealId) {
    return null;
  }

  return (
    <DealIdProvider value={dealId}>
      <DealPageNavigator dealId={dealId}>
        <PageContainer>
          <RecordSidePanel expanded expandedMode="page" expandable={false}>
            <PageHeader>
              <PageHeader.Start className="flex-auto min-w-0">
                <DealPageBreadcrumb dealId={dealId} />
              </PageHeader.Start>
              <PageHeader.End>
                <DealPanelActions dealId={dealId} />
              </PageHeader.End>
            </PageHeader>
            <DealPageBody dealId={dealId} />
          </RecordSidePanel>
        </PageContainer>
      </DealPageNavigator>
    </DealIdProvider>
  );
};
