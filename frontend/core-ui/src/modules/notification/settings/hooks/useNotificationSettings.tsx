import { useQuery } from '@apollo/client';
import { NOTIFICATION_SETTINGS } from '../graphql/notificationSettingsQueries';

interface NotificationChannelMetadata {
  [key: string]: unknown;
}

interface NotificationChannel {
  enabled: boolean;
  metadata?: NotificationChannelMetadata;
}

interface NotificationEvent {
  enabled: boolean;
  channels: string[];
}

interface NotificationSetting {
  userId: string;
  events: Record<string, NotificationEvent>;
  channels: Record<string, NotificationChannel>;
  createdAt: string;
  updatedAt: string;
}

interface NotificationSettingsResponse {
  notificationSettings: NotificationSetting;
}

export const useNotificationSettings = () => {
  const { data, loading } = useQuery<NotificationSettingsResponse>(
    NOTIFICATION_SETTINGS,
  );

  return {
    notificationSettings:
      data?.notificationSettings ?? ({} as NotificationSetting),
    loading,
  };
};
