import type { SalesDealNotificationContentProps } from '~/widgets/notifications/my-inbox/types/notificationContent';
import { useDealDetail } from '@/deals/cards/hooks/useDeals';
import { Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { DealsProvider } from '@/deals/context/DealContext';
import { NotificationContentUnavailable } from '~/widgets/notifications/my-inbox/components/NotificationContentUnavailable';
import { SalesDealDetailView } from '~/widgets/notifications/my-inbox/components/SalesDealDetailView';

export const SalesDealNotificationContent = ({
  action,
  createdAt,
  contentTypeId,
  fromUser,
}: SalesDealNotificationContentProps) => {
  const { t } = useTranslation('sales');
  const { deal, loading, error } = useDealDetail({
    variables: { _id: contentTypeId || '' },
    skip: !contentTypeId,
  });

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

  if (loading) {
    return (
      <div className="flex min-h-full items-center justify-center">
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
      <SalesDealDetailView
        action={action}
        createdAt={createdAt}
        deal={deal}
        fromUser={fromUser}
      />
    </DealsProvider>
  );
};
