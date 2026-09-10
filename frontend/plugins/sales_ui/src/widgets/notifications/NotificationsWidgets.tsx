import { useQuery } from '@apollo/client';
import { IconExternalLink, IconInfoCircle } from '@tabler/icons-react';
import {
  Avatar,
  Button,
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
      <div className="flex min-h-dvh w-full flex-col">
        <header className="sticky top-0 z-10 flex flex-wrap items-center gap-3 border-b bg-background px-6 py-4">
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-xl font-semibold text-foreground">
              {deal.name || t('untitled-deal', 'Untitled deal')}
            </h2>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              {deal.number && <span>#{deal.number}</span>}
              {fromUser && (
                <span className="flex items-center gap-1.5">
                  <Avatar className="size-5">
                    <Avatar.Image
                      src={readImage(fromUser.details?.avatar || '')}
                      alt={getUserDisplayName(fromUser)}
                    />
                    <Avatar.Fallback className="text-[10px]">
                      {getUserDisplayName(fromUser)[0].toUpperCase()}
                    </Avatar.Fallback>
                  </Avatar>
                  {getUserDisplayName(fromUser)}
                </span>
              )}
              {action && <span>{action}</span>}
              {createdAt && <RelativeDateDisplay.Value value={createdAt} />}
            </div>
          </div>
          <Button variant="secondary" asChild>
            <Link to={buildDealPath(deal)}>
              <IconExternalLink className="size-4" />
              {t('open-deal', 'Open deal')}
            </Link>
          </Button>
        </header>
        <div className="flex-1 overflow-auto">
          <Overview deal={deal} />
        </div>
      </div>
    </DealsProvider>
  );
};

const NotificationContentUnavailable = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="flex max-w-sm flex-col items-center text-center">
        <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-accent text-muted-foreground">
          <IconInfoCircle className="size-5" />
        </div>
        <h3 className="text-base font-medium text-foreground">{title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};

const NotificationsWidgets = (props: TNotification) => {
  const { t } = useTranslation('sales');
  const [, moduleName] = (props.contentType || '').replace(':', '.').split('.');

  if (moduleName === 'deal') {
    return <SalesDealNotificationContent {...props} />;
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
