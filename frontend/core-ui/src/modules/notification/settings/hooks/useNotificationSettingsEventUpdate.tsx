import { useMutation } from '@apollo/client';
import { UPDATE_NOTIFICATION_SETTINGS_EVENT } from '../graphql/notificationSettingsMutations';
import { NOTIFICATION_SETTINGS } from '../graphql/notificationSettingsQueries';

export type NotificationSettingsEventInput = {
  event?: string;
  enabled?: boolean;
  channels?: string[];
};

export type UpdateNotificationSettingsEventResponse = {
  updateNotificationSettingsEvent: {
    success: boolean;
  };
};

export const useNotificationSettingsEventUpdate = () => {
  const [mutate, { data, loading, error }] = useMutation<
    UpdateNotificationSettingsEventResponse,
    { input: NotificationSettingsEventInput }
  >(UPDATE_NOTIFICATION_SETTINGS_EVENT);

  const updateNotificationSettingsEvent = async (
    input: NotificationSettingsEventInput,
  ) => {
    return mutate({
      variables: { input },
      refetchQueries: [NOTIFICATION_SETTINGS],
    });
  };

  return {
    updateNotificationSettingsEvent,
    data,
    loading,
    error,
  };
};
