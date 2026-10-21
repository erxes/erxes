import type { MarkNotificationAsRead } from '@/notification/types/myInbox';
import {
  NOTIFICATIONS,
  UNREAD_NOTIFICATIONS_COUNT,
} from '@/notification/graphql/notificationsQueries';
import { MARK_AS_READ_NOTIFICATION } from '@/notification/graphql/notificationMutations';
import { useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { useCallback } from 'react';

export const useMarkAsReadNotification = (): MarkNotificationAsRead => {
  const [markAsRead] = useMutation(MARK_AS_READ_NOTIFICATION, {
    refetchQueries: [NOTIFICATIONS, UNREAD_NOTIFICATIONS_COUNT],
  });
  const { toast } = useToast();

  return useCallback(
    async (id: string): Promise<boolean> => {
      try {
        await markAsRead({
          variables: { id },
          update: (cache) => {
            cache.modify({
              id: cache.identify({ __typename: 'Notification', _id: id }),
              fields: { isRead: () => true },
            });
          },
        });
        return true;
      } catch (error) {
        toast({
          title:
            error instanceof Error
              ? error.message
              : 'Unable to mark notification as read',
          variant: 'destructive',
        });
        return false;
      }
    },
    [markAsRead, toast],
  );
};
