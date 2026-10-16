import {
  ARCHIVE_NOTIFICATION,
  MARK_ALL_NOTIFICATIONS_AS_READ,
} from '@/notification/graphql/notificationMutations';
import { useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

const REFETCH_QUERIES = ['Notifications', 'UnreadNotificationsCount'];

const showError = (error: Error) =>
  toast({ title: error.message, variant: 'destructive' });

export const useInboxActions = () => {
  const { t } = useTranslation('common', { keyPrefix: 'notification' });
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
          title: t('all-marked-read'),
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
          toast({ title: t('notification-archived'), variant: 'success' }),
      }),
    archiving,
    markAllRead: () => markAllRead(),
    markingAllRead,
  };
};
