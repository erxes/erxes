import { useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { CORE_NOTIFICATIONS_DELETE } from '@/notification/graphql/notificationMutations';
import {
  NOTIFICATIONS,
  UNREAD_NOTIFICATIONS_COUNT,
} from '@/notification/graphql/notificationsQueries';

export const useDeleteNotifications = (): ((
  ids: string[],
) => Promise<boolean>) => {
  const { toast } = useToast();
  const { t } = useTranslation('common', { keyPrefix: 'notification' });
  const [deleteNotifications] = useMutation<{
    coreNotificationsDelete: string[];
  }>(CORE_NOTIFICATIONS_DELETE, {
    refetchQueries: [NOTIFICATIONS, UNREAD_NOTIFICATIONS_COUNT],
    update: (cache, { data }) => {
      for (const id of data?.coreNotificationsDelete || []) {
        const cacheId = cache.identify({ __typename: 'Notification', _id: id });
        if (cacheId) cache.evict({ id: cacheId });
      }
      cache.gc();
    },
  });
  return useCallback(
    async (ids: string[]): Promise<boolean> => {
      if (!ids.length) return true;
      try {
        const { data } = await deleteNotifications({ variables: { ids } });
        if (data?.coreNotificationsDelete.length !== ids.length)
          throw new Error(t('delete-failed', 'Unable to delete notifications'));
        toast({
          title: t('notifications-deleted', {
            defaultValue: '{{count}} notifications deleted',
            count: ids.length,
          }),
        });
        return true;
      } catch (error) {
        toast({
          title:
            error instanceof Error
              ? error.message
              : t('delete-failed', 'Unable to delete notifications'),
          variant: 'destructive',
        });
        return false;
      }
    },
    [deleteNotifications, toast, t],
  );
};
