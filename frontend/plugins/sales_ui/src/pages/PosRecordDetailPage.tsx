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
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import {
  type IRecordSidePanelTab,
  PageHeader,
  RecordSidePanel,
} from 'ui-modules';
import { useGetCurrentUsersPos } from '@/pos/hooks/useGetCurrentUsersPos';
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
          <Button variant="ghost" className="min-w-0">
            {title}
          </Button>
        </Breadcrumb.Item>
      </Breadcrumb.List>
    </Breadcrumb>
  );
};

const PosRecordPage = ({
  breadcrumb,
  actions,
  overviewHeader,
  tabs,
  defaultTab,
}: {
  breadcrumb: ReactNode;
  actions?: ReactNode;
  overviewHeader: ReactNode;
  tabs: IRecordSidePanelTab[];
  defaultTab: string;
}) => {
  const [tab, setTab] = useQueryState<string>('tab');

  return (
    <PageContainer>
      <RecordSidePanel expanded expandedMode="page" expandable={false}>
        <PageHeader>
          <PageHeader.Start className="flex-auto min-w-0">
            {breadcrumb}
          </PageHeader.Start>
          {actions && <PageHeader.End>{actions}</PageHeader.End>}
        </PageHeader>
        <RecordSidePanel.Tabs
          value={tab ?? defaultTab}
          onValueChange={setTab}
          visibleCount={3}
          overviewTab={DETAIL_TAB}
          expandedDefaultTab={defaultTab}
          overviewHeader={
            <div className="min-w-0 flex-1 truncate text-sm">
              {overviewHeader}
            </div>
          }
          tabs={tabs}
        />
      </RecordSidePanel>
    </PageContainer>
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
      breadcrumb={
        <PosPageBreadcrumb
          section="orders"
          sectionLabel={tSales('pos-orders')}
          title={<PosOrderPanelTitle orderId={orderId} />}
        />
      }
      overviewHeader={<PosOrderPanelTitle orderId={orderId} />}
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
      breadcrumb={
        <PosPageBreadcrumb
          section="covers"
          sectionLabel={tSales('pos-covers')}
          title={tSales('cover-detail')}
        />
      }
      actions={<PosCoverPanelActions coverId={coverId} />}
      overviewHeader={<PosCoverPanelTitle coverId={coverId} />}
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
