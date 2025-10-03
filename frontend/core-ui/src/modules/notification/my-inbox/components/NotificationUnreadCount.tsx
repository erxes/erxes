import { useNotificationsListContext } from '@/notification/my-inbox/context/NotificationsListContext';
import { Skeleton, useQueryState } from 'erxes-ui';

export const NotificationsCountLabel = () => {
  const [status] = useQueryState<string>('status');

  const { totalCount, loading } = useNotificationsListContext();

  return (
    <div className="flex justify-end font-medium text-accent-foreground text-xs">
      {loading ? (
        <Skeleton className="w-16 h-4" />
      ) : (
        generateText(totalCount, status || 'all')
      )}
    </div>
  );
};

const generateText = (totalCount: number, status: string | null) => {
  const normalizedStatus = status?.toLowerCase();

  if (totalCount === 0) {
    if (normalizedStatus === 'read') {
      return 'No read notifications';
    }

    if (normalizedStatus === 'all') {
      return 'No notifications';
    }

    // Covers 'unread' and undefined/null
    return 'No unread notifications';
  }

  switch (normalizedStatus) {
    case 'read':
      return `${totalCount} read notification${totalCount > 1 ? 's' : ''}`;
    case 'all':
      return `${totalCount} notification${totalCount > 1 ? 's' : ''}`;
    default:
      return `${totalCount} unread notification${totalCount > 1 ? 's' : ''}`;
  }
};
