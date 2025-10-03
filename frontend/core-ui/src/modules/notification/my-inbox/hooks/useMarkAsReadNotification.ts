import { MARK_AS_READ_NOTIFICATION } from '@/notification/my-inbox/graphql/notificationMutations';
import { useMutation } from '@apollo/client';

export const useMarkAsReadNotification = () => {
  const [markAsRead] = useMutation(MARK_AS_READ_NOTIFICATION, {});

  const handleMarkAsRead = (id: string) => {
    markAsRead({
      variables: { id: id },
      update: (cache) => {
        if (!id) return;
        cache.modify({
          id: cache.identify({ __typename: 'Notification', _id: id }),
          fields: {
            isRead: () => true,
          },
        });
      },
    });
  };

  return handleMarkAsRead;
};
