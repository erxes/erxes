import { NOTIFICATION_SETTINGS } from '@/notification/graphql/notificationsQueries';
import { NotificationSetting } from '@/notification/types/notifications';
import { useQuery } from '@apollo/client';

export const useNotificationSettings = () => {
  const { data, loading } = useQuery<{
    notificationSettings: NotificationSetting[];
  }>(NOTIFICATION_SETTINGS);

  const { notificationSettings = [] } = data || {};

  return {
    notificationSettings,
    loading,
  };
};
