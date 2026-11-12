import {
  IconCashRegister,
  IconCreditCard,
  IconHistory,
  IconId,
} from '@tabler/icons-react';
import {
  Breadcrumb,
  Button,
  PageContainer,
  Separator,
  useQueryState,
} from 'erxes-ui';
import { type ReactNode, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  type IRecordSidePanelTab,
  type ISidePanelNavigator,
  PageHeader,
  RecordPageMinimize,
  RecordSidePanel,
  SidePanelNavigatorContext,
  useSidePanel,
} from 'ui-modules';
import {
  POS_COVER_CONTENT_TYPE,
  POS_ORDER_CONTENT_TYPE,
} from '@/pos/constants/posPanel';
import { useGetCurrentUsersPos } from '@/pos/hooks/useGetCurrentUsersPos';
import {
  PosCoverPanelActions,
  PosCoverPanelDetail,
} from '~/widgets/record-panel/PosCoverPanel';
import {
  PosOrderPanelDetail,
  PosOrderPanelPayments,
} from '~/widgets/record-panel/PosOrderPanelDetail';
import { PosPanelActivity } from '~/widgets/record-panel/PosPanelShared';
import { PosOrderPanelTitle } from '~/widgets/record-panel/RecordPanel';

const DETAIL_TAB = 'detail';
const PAYMENTS_TAB = 'payments';
const ACTIVITY_TAB = 'activity';

const PosPageBreadcrumb = ({
  section,
  sectionLabel,
  title,
}: {
  section: 'orders' | 'covers';
  sectionLabel: string;
  title: ReactNode;
}) => {
  const { t } = useTranslation('sales');
  const { posId } = useParams<{ posId?: string }>();
  const { pos } = useGetCurrentUsersPos({ skip: !posId });
  const posName = pos?.find((item) => item._id === posId)?.name;

  return (
    <Breadcrumb className="min-w-0">
      <Breadcrumb.List className="gap-1 flex-nowrap min-w-0">
        <Breadcrumb.Item className="shrink-0">
          <Button variant="ghost" asChild>
            <Link to="/sales/pos">
              <IconCashRegister />
              {t('pos')}
            </Link>
          </Button>
        </Breadcrumb.Item>
        {posId && (
          <>
            <Separator.Inline />
            <Breadcrumb.Item className="shrink-0">
              <Button variant="ghost" asChild>
                <Link to={`/sales/pos/${posId}/${section}`}>
                  {posName || sectionLabel}
                </Link>
              </Button>
            </Breadcrumb.Item>
          </>
        )}
        <Separator.Inline />
        <Breadcrumb.Item className="min-w-0">
          <Breadcrumb.Page className="block min-w-0 max-w-md truncate px-2 text-sm">
            {title}
          </Breadcrumb.Page>
        </Breadcrumb.Item>
      </Breadcrumb.List>
    </Breadcrumb>
  );
};

const PosRecordPage = ({
  contentType,
  contentId,
  section,
  breadcrumb,
  actions,
  tabs,
  defaultTab,
}: {
  contentType: string;
  contentId: string;
  section: 'orders' | 'covers';
  breadcrumb: ReactNode;
  actions?: ReactNode;
  tabs: IRecordSidePanelTab[];
  defaultTab: string;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'side-panel' });
  const [tab, setTab] = useQueryState<string>('tab');
  const { posId } = useParams<{ posId?: string }>();
  const navigate = useNavigate();
  const { openRecord } = useSidePanel();
  const listPath = posId ? `/sales/pos/${posId}/${section}` : '/sales/pos';
  const record = useMemo(
    () => ({ contentType, contentId }),
    [contentType, contentId],
  );

  const backToList = useCallback(
    () => navigate(listPath, { replace: true }),
    [navigate, listPath],
  );

  const navigator = useMemo<ISidePanelNavigator>(
    () => ({
      record,
      tab: tab ?? '',
      setTab,
      openRecord,
      back: backToList,
      canGoBack: false,
      close: backToList,
      listPath,
    }),
    [record, tab, setTab, openRecord, backToList, listPath],
  );

  return (
    <SidePanelNavigatorContext.Provider value={navigator}>
      <PageContainer>
        <RecordSidePanel expanded expandedMode="page" expandable={false}>
          <PageHeader>
            <PageHeader.Start className="flex-auto min-w-0">
              {breadcrumb}
            </PageHeader.Start>
            <PageHeader.End>
              {actions}
              <RecordPageMinimize />
            </PageHeader.End>
          </PageHeader>
          <RecordSidePanel.Tabs
            value={tab ?? defaultTab}
            onValueChange={setTab}
            visibleCount={3}
            overviewTab={DETAIL_TAB}
            expandedDefaultTab={defaultTab}
            overviewHeader={
              <div className="flex min-w-0 flex-1 items-center gap-1.5 text-sm">
                <IconId className="size-4 shrink-0" />
                <span className="truncate">{t('detail')}</span>
              </div>
            }
            tabs={tabs}
          />
        </RecordSidePanel>
      </PageContainer>
    </SidePanelNavigatorContext.Provider>
  );
};

const PosPageDetail = ({ children }: { children: ReactNode }) => (
  <div className="@container/record-panel flex min-h-0 flex-1 flex-col">
    {children}
  </div>
);

export const PosOrderDetailPage = () => {
  const { t } = useTranslation('common', { keyPrefix: 'side-panel' });
  const { t: tSales } = useTranslation('sales');
  const { orderId } = useParams<{ orderId: string }>();

  if (!orderId) {
    return null;
  }

  return (
    <PosRecordPage
      key={orderId}
      contentType={POS_ORDER_CONTENT_TYPE}
      contentId={orderId}
      section="orders"
      breadcrumb={
        <PosPageBreadcrumb
          section="orders"
          sectionLabel={tSales('pos-orders')}
          title={<PosOrderPanelTitle orderId={orderId} />}
        />
      }
      defaultTab={PAYMENTS_TAB}
      tabs={[
        {
          value: DETAIL_TAB,
          label: t('detail'),
          icon: IconId,
          content: (
            <PosPageDetail>
              <PosOrderPanelDetail orderId={orderId} />
            </PosPageDetail>
          ),
        },
        {
          value: PAYMENTS_TAB,
          label: tSales('payments'),
          icon: IconCreditCard,
          content: <PosOrderPanelPayments orderId={orderId} />,
        },
        {
          value: ACTIVITY_TAB,
          label: t('activity'),
          icon: IconHistory,
          content: <PosPanelActivity contentId={orderId} />,
        },
      ]}
    />
  );
};

export const PosCoverDetailPage = () => {
  const { t } = useTranslation('common', { keyPrefix: 'side-panel' });
  const { t: tSales } = useTranslation('sales');
  const { coverId } = useParams<{ coverId: string }>();

  if (!coverId) {
    return null;
  }

  return (
    <PosRecordPage
      key={coverId}
      contentType={POS_COVER_CONTENT_TYPE}
      contentId={coverId}
      section="covers"
      breadcrumb={
        <PosPageBreadcrumb
          section="covers"
          sectionLabel={tSales('pos-covers')}
          title={tSales('cover-detail')}
        />
      }
      actions={<PosCoverPanelActions coverId={coverId} />}
      defaultTab={ACTIVITY_TAB}
      tabs={[
        {
          value: DETAIL_TAB,
          label: t('detail'),
          icon: IconId,
          content: (
            <PosPageDetail>
              <PosCoverPanelDetail coverId={coverId} />
            </PosPageDetail>
          ),
        },
        {
          value: ACTIVITY_TAB,
          label: t('activity'),
          icon: IconHistory,
          content: <PosPanelActivity contentId={coverId} />,
        },
      ]}
    />
  );
};
