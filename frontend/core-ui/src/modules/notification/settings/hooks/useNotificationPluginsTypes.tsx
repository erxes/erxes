import { PluginsNotificationConfig } from '@/notification/types/notifications';
import { useQuery } from '@apollo/client';
import { NOTIFICATION_PLUGINS_TYPES } from '../graphql/notificationSettingsQueries';

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
