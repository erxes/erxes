import { useNotificationSettings } from '@/notification/hooks/useNotificationSettings';
import { NotificationSettingsPlugins } from '../NotificationSettingsPlugins';

export const NotificationSettingsMenuEmail = () => {
  const { notificationSettings } = useNotificationSettings();

  return <NotificationSettingsPlugins />;
};
