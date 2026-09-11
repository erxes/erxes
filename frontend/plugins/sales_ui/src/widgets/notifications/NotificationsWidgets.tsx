import { useQuery } from '@apollo/client';
import {
  IconExternalLink,
  IconInfoCircle,
  IconNote,
} from '@tabler/icons-react';
import {
  Avatar,
  Button,
  Empty,
  RelativeDateDisplay,
  Spinner,
  readImage,
} from 'erxes-ui';
import { Link } from 'react-router-dom';
import { IUser, TNotification } from 'ui-modules';
import { useTranslation } from 'react-i18next';

import { GET_DEAL_DETAIL } from '@/deals/graphql/queries/DealsQueries';
import { IDeal } from '@/deals/types/deals';
import { DealsProvider } from '@/deals/context/DealContext';
import { Overview } from '@/deals/cards/components/detail/overview/Overview';

const getUserDisplayName = (user?: IUser) =>
  user?.details?.fullName || user?.email || 'Unknown user';

const buildDealPath = (deal: IDeal) => {
  const searchParams = new URLSearchParams({ salesItemId: deal._id });
  if (deal.boardId) searchParams.set('boardId', deal.boardId);
  if (deal.pipeline?._id) searchParams.set('pipelineId', deal.pipeline._id);
  return `/sales/deals?${searchParams.toString()}`;
};

const NotificationContentUnavailable = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => (
  <div className="flex min-h-dvh items-center justify-center p-6">
    <Empty>
      <Empty.Header>
        <Empty.Media variant="icon">
          <IconInfoCircle />
        </Empty.Media>
        <Empty.Title>{title}</Empty.Title>
        <Empty.Description>{description}</Empty.Description>
      </Empty.Header>
    </Empty>
  </div>
);

const DealNotificationHeader = ({
  action,
  createdAt,
  deal,
  fromUser,
}: Pick<TNotification, 'action' | 'createdAt' | 'fromUser'> & {
  deal: IDeal;
}) => {
  const { t } = useTranslation('sales');
  const actorName = getUserDisplayName(fromUser);

  return (
    <header className="border-b py-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {deal.number ? `Deal #${deal.number}` : t('deal', 'Deal')}
          </p>
          <h2 className="mt-1 break-words text-2xl font-semibold text-foreground">
            {deal.name || t('untitled-deal', 'Untitled deal')}
          </h2>
        </div>
        <Button variant="secondary" asChild>
          <Link to={buildDealPath(deal)}>
            <IconExternalLink className="size-4" />
            {t('open-deal', 'Open deal')}
          </Link>
        </Button>
      </div>
      <div className="mt-4 flex flex-wrap gap-x-3 gap-y-2 text-sm text-muted-foreground">
        {fromUser && (
          <span className="inline-flex items-center gap-2">
            <Avatar className="size-5">
              <Avatar.Image
                src={readImage(fromUser.details?.avatar || '')}
                alt={actorName}
              />
              <Avatar.Fallback className="text-[10px]">
                {actorName[0].toUpperCase()}
              </Avatar.Fallback>
            </Avatar>
            {actorName}
          </span>
        )}
        {action && <span>{action}</span>}
        {createdAt && <RelativeDateDisplay.Value value={createdAt} />}
      </div>
    </header>
  );
};

const SalesDealNotificationContent = ({
  action,
  createdAt,
  contentTypeId,
  fromUser,
}: TNotification) => {
  const { t } = useTranslation('sales');
  const { data, loading, error } = useQuery<{ dealDetail: IDeal }>(
    GET_DEAL_DETAIL,
    {
      variables: { _id: contentTypeId || '' },
      skip: !contentTypeId,
    },
  );

  if (error) {
    return (
      <NotificationContentUnavailable
        title={t('failed-to-load-deal', 'Failed to load deal')}
        description={error.message}
      />
    );
  }

  if (!contentTypeId) {
    return (
      <NotificationContentUnavailable
        title={t(
          'notification-content-unavailable',
          'Notification content unavailable',
        )}
        description={t(
          'notification-missing-deal',
          'This sales notification is missing a linked deal.',
        )}
      />
    );
  }

  const deal = data?.dealDetail;

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!deal) {
    return (
      <NotificationContentUnavailable
        title={t('deal-not-found', 'Deal not found')}
        description={t(
          'deal-no-longer-available',
          'This deal may have been removed or is no longer available.',
        )}
      />
    );
  }

  return (
    <DealsProvider>
      <div className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col px-6">
        <DealNotificationHeader
          action={action}
          createdAt={createdAt}
          deal={deal}
          fromUser={fromUser}
        />
        <div className="flex-1 py-4">
          <Overview deal={deal} />
        </div>
      </div>
    </DealsProvider>
  );
};

const SalesNoteNotificationContent = ({
  createdAt,
  fromUser,
  message,
  title,
}: TNotification) => {
  const { t } = useTranslation('sales');
  const actorName = getUserDisplayName(fromUser);

  return (
    <article className="mx-auto min-h-dvh w-full max-w-3xl px-6 py-8">
      <div className="flex items-start gap-4 border-b pb-6">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-accent text-muted-foreground">
          <IconNote className="size-6" />
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t('note', 'Note')}
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-foreground">
            {title}
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            {fromUser ? actorName : t('system', 'System')}
            {createdAt && (
              <>
                {' · '}
                <RelativeDateDisplay.Value value={createdAt} />
              </>
            )}
          </p>
        </div>
      </div>
      <p className="py-6 text-sm leading-6 text-foreground">{message}</p>
    </article>
  );
};

const NotificationsWidgets = (props: TNotification) => {
  const { t } = useTranslation('sales');
  const [, moduleName] = (props.contentType || '').replace(':', '.').split('.');

  if (moduleName === 'deal' || moduleName === 'deals') {
    return <SalesDealNotificationContent {...props} />;
  }

  if (moduleName === 'note') {
    return <SalesNoteNotificationContent {...props} />;
  }

  return (
    <NotificationContentUnavailable
      title={t(
        'notification-content-unavailable',
        'Notification content unavailable',
      )}
      description={t(
        'notification-no-detail-view',
        'This sales notification does not have a linked detail view yet.',
      )}
    />
  );
};

export default NotificationsWidgets;
