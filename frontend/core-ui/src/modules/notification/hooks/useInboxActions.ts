import {
  ARCHIVE_NOTIFICATION,
  MARK_ALL_NOTIFICATIONS_AS_READ,
} from '@/notification/graphql/notificationMutations';
import { useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';

const REFETCH_QUERIES = ['Notifications', 'UnreadNotificationsCount'];

const showError = (error: Error) =>
  toast({ title: error.message, variant: 'destructive' });

export const useInboxActions = () => {
  const [archive, { loading: archiving }] = useMutation(ARCHIVE_NOTIFICATION, {
    refetchQueries: REFETCH_QUERIES,
    onError: showError,
  });
  const [markAllRead, { loading: markingAllRead }] = useMutation(
    MARK_ALL_NOTIFICATIONS_AS_READ,
    {
      refetchQueries: REFETCH_QUERIES,
      onCompleted: () =>
        toast({
          title: 'All notifications marked as read',
          variant: 'success',
        }),
      onError: showError,
    },
  );

  return {
    archiveNotification: (id: string) =>
      archive({
        variables: { id },
        onCompleted: () =>
          toast({ title: 'Notification archived', variant: 'success' }),
      }),
    archiving,
    markAllRead: () => markAllRead(),
    markingAllRead,
  };
};
