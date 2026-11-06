import { toGraphqlView } from '@/utils/graphql';
import { gql } from '~/gql';
import { useQuery } from '@apollo/client';
import { IconActivity, IconExternalLink } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { TR_STATUS_LABELS } from '@/transactions/types/constants';
import { useTransactionsDetail } from '@/transactions/transaction-form/hooks/useTransactionsDetail';
import {
  ISettingsPanelViewProps,
  ISettingsPanelViews,
  SettingsPanelDetailLayout,
} from '@/settings/components/panel/SettingsPanelLayout';
import { useSettingsPanel } from '@/settings/hooks/useSettingsPanel';
import { Badge, Button, ScrollArea, useQueryState } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { ReactNode, useEffect, useState } from 'react';
import {
  ActivityLogCustomActivity,
  ActivityLogs,
  AddInternalNote,
  MembersInline,
  PanelField,
  TActivityLog,
  useSidePanel,
} from 'ui-modules';
import {
  TRANSACTION_ACTIVITY_TAB,
  TRANSACTION_CONTENT_TYPE,
} from '@/transactions/constants/transactionPanel';

const Sentence = ({ children }: { children: ReactNode }) => (
  <div className="flex flex-wrap items-center gap-1 text-sm text-foreground">
    {children}
  </div>
);

const StatusBadge = ({ status }: { status?: string }) => {
  const { t } = useTranslation('accounting');
  if (!status) {
    return null;
  }

  return (
    <Badge variant="secondary" className="font-medium">
      {t(TR_STATUS_LABELS[status] || '') || status}
    </Badge>
  );
};

const MentionMembers = ({ memberIds }: { memberIds?: string[] }) => {
  const { t } = useTranslation('accounting');
  const ids = [...new Set((memberIds || []).filter(Boolean))];

  if (!ids.length) {
    return null;
  }

  return (
    <MembersInline
      memberIds={ids}
      placeholder={t('unknown-user')}
      className="font-medium"
    />
  );
};

const TrCreatedActivityRow = ({ activity }: { activity: TActivityLog }) => {
  const { t } = useTranslation('accounting');
  const current = activity.changes?.current || {};

  return (
    <Sentence>
      <ActivityLogs.ActorName activity={activity} />
      <span className="text-muted-foreground">{t('created-a-voucher')}</span>
      <StatusBadge status={current.status || activity.metadata?.status} />
      <MentionMembers memberIds={current.mentionUserIds} />
    </Sentence>
  );
};

const TrStatusActivityRow = ({ activity }: { activity: TActivityLog }) => {
  const { t } = useTranslation('accounting');
  const prev = activity.changes?.prev || {};
  const current = activity.changes?.current || {};

  return (
    <Sentence>
      <ActivityLogs.ActorName activity={activity} />
      <span className="text-muted-foreground">{t('changed-the-status')}</span>
      <StatusBadge status={prev.status} />
      <span className="text-muted-foreground">-&gt;</span>
      <StatusBadge status={current.status} />
    </Sentence>
  );
};

const TrMentionActivityRow = ({ activity }: { activity: TActivityLog }) => {
  const { t } = useTranslation('accounting');
  const prev = activity.changes?.prev || {};
  const current = activity.changes?.current || {};

  return (
    <div className="flex flex-col gap-1">
      <Sentence>
        <ActivityLogs.ActorName activity={activity} />
        <span className="text-muted-foreground">
          {t('changed-the-approver')}
        </span>
      </Sentence>
      <div className="flex flex-wrap items-center gap-2 pl-0 text-sm">
        <span className="text-muted-foreground">
          {t('previous', { nsSeparator: false })}
        </span>
        <MentionMembers memberIds={prev.mentionUserIds} />
        <span className="text-muted-foreground">
          {t('current', { nsSeparator: false })}
        </span>
        <MentionMembers memberIds={current.mentionUserIds} />
      </div>
    </div>
  );
};

const transactionCustomActivities: ActivityLogCustomActivity[] = [
  {
    type: 'transaction.created',
    render: (activity) => <TrCreatedActivityRow activity={activity} />,
  },
  {
    type: 'transaction.status_changed',
    render: (activity) => <TrStatusActivityRow activity={activity} />,
  },
  {
    type: 'transaction.mention_changed',
    render: (activity) => <TrMentionActivityRow activity={activity} />,
  },
];

const DEAL_LINK_QUERY = gql(`
query accountingDealLink($_id: String) {
  dealLink(_id: $_id)
}
`);

const POS_ORDER_LINK_QUERY = gql(`
query accountingPosOrderLink($_id: String) {
  posOrderLink(_id: $_id)
}
`);

const isDealContent = (contentType?: string) =>
  ['sales:deal', 'sales:sales.deals'].includes(contentType || '');

const isPosOrderContent = (contentType?: string) =>
  ['sales:order', 'sales:pos.orders'].includes(contentType || '');

const getRelatedContentLabel = (contentType?: string) => {
  if (isDealContent(contentType)) {
    return 'open-deal';
  }

  if (isPosOrderContent(contentType)) {
    return 'open-pos-order';
  }

  return 'open-related-record';
};

const PanelValue = ({ children }: { children: ReactNode }) => (
  <div className="flex h-7 items-center truncate px-2">{children}</div>
);

const useRelatedContentHref = (contentType?: string, contentId?: string) => {
  const { data: rawGraphqlDealLinkData } = useQuery(DEAL_LINK_QUERY, {
    variables: { _id: contentId ?? '' },
    skip: !contentId || !isDealContent(contentType),
  });
  const dealLinkData = toGraphqlView(rawGraphqlDealLinkData);
  const { data: rawGraphqlPosOrderLinkData } = useQuery(POS_ORDER_LINK_QUERY, {
    variables: { _id: contentId ?? '' },
    skip: !contentId || !isPosOrderContent(contentType),
  });
  const posOrderLinkData = toGraphqlView(rawGraphqlPosOrderLinkData);
  const readHref = (value: unknown) =>
    value &&
    typeof value === 'object' &&
    'href' in value &&
    typeof value.href === 'string'
      ? value.href
      : undefined;

  return (
    readHref(dealLinkData?.dealLink) || readHref(posOrderLinkData?.posOrderLink)
  );
};

const TransactionPanelDetail = ({ contentId }: ISettingsPanelViewProps) => {
  const { t } = useTranslation('accounting');
  const { activeTrs, loading } = useTransactionsDetail({
    variables: { _id: contentId },
    skip: !contentId,
  });
  const transaction = activeTrs?.[0];
  const relatedContentHref = useRelatedContentHref(
    transaction?.contentType ?? undefined,
    transaction?.contentId ?? undefined,
  );

  return (
    <SettingsPanelDetailLayout loading={loading} hasRecord={!!transaction}>
      {transaction && (
        <>
          <PanelField label={t('number')}>
            <PanelValue>
              {transaction.ptrNumber || transaction.number}
            </PanelValue>
          </PanelField>
          <PanelField label={t('date')}>
            <PanelValue>
              {transaction.date
                ? dayjs(new Date(transaction.date)).format('YYYY-MM-DD')
                : ''}
            </PanelValue>
          </PanelField>
          <PanelField label={t('status')}>
            <PanelValue>
              <StatusBadge status={transaction.status ?? undefined} />
            </PanelValue>
          </PanelField>
          <PanelField label={t('description')}>
            <PanelValue>{transaction.description}</PanelValue>
          </PanelField>
          {!!relatedContentHref && (
            <Button variant="secondary" className="mt-2 w-fit" asChild>
              <a href={relatedContentHref} target="_blank" rel="noreferrer">
                <IconExternalLink />
                {t(
                  getRelatedContentLabel(transaction.contentType ?? undefined),
                )}
              </a>
            </Button>
          )}
        </>
      )}
    </SettingsPanelDetailLayout>
  );
};

const TransactionPanelActivity = ({ contentId }: ISettingsPanelViewProps) => (
  <div className="flex flex-1 min-h-0 flex-col">
    <ScrollArea className="flex-1 min-h-0" viewportClassName="[&>div]:block!">
      <div className="pt-3 [&_.px-6]:px-2">
        <ActivityLogs
          targetId={contentId}
          customActivities={transactionCustomActivities}
          variant="backward"
        />
      </div>
    </ScrollArea>
    <div className="shrink-0 pb-4 pt-2 [&_.ml-10]:ml-4 [&_.mr-8]:mr-4">
      <AddInternalNote
        contentTypeId={contentId}
        contentType={TRANSACTION_CONTENT_TYPE}
      />
    </div>
  </div>
);

export const TRANSACTION_PANEL: ISettingsPanelViews = {
  addLabel: 'transaction',
  editLabel: 'transaction',
  Detail: TransactionPanelDetail,
  Activity: TransactionPanelActivity,
};

export const TrRightSidebar = () => {
  const { t } = useTranslation('accounting');
  const [parentId] = useQueryState<string>('parentId');
  const { openDetail } = useSettingsPanel(TRANSACTION_CONTENT_TYPE);
  const { record, setTab } = useSidePanel();
  const [activityRequested, setActivityRequested] = useState(false);

  useEffect(() => {
    if (
      activityRequested &&
      record?.contentType === TRANSACTION_CONTENT_TYPE &&
      record.contentId === parentId
    ) {
      setTab(TRANSACTION_ACTIVITY_TAB);
      setActivityRequested(false);
    }
  }, [activityRequested, parentId, record, setTab]);

  if (!parentId) {
    return null;
  }

  const handleOpen = () => {
    openDetail(parentId);
    setActivityRequested(true);
  };

  return (
    <Button
      type="button"
      variant="secondary"
      title={t('activities')}
      aria-label={t('activities')}
      onClick={handleOpen}
    >
      <IconActivity />
    </Button>
  );
};
