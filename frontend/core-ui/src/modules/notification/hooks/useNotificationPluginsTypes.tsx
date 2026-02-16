import { NOTIFICATION_PLUGINS_TYPES } from '@/notification/graphql/notificationsQueries';
import { PluginsNotificationConfig } from '@/notification/types/notifications';
import { useQuery } from '@apollo/client';

export const useNotificationPluginsTypes = () => {
  const { data, loading } = useQuery<{
    pluginsNotifications: PluginsNotificationConfig[];
  }>(NOTIFICATION_PLUGINS_TYPES);

  const { pluginsNotifications = [] } = data || {};

  return {
    pluginsNotifications,
    loading,
  };
};
