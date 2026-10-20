import { useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { UPDATE_NOTIFICATION_SETTINGS_EVENT } from '../graphql/notificationSettingsMutations';
import { NOTIFICATION_SETTINGS } from '../graphql/notificationSettingsQueries';
import { NotificationSettingsResponse } from './useNotificationSettings';

export type NotificationSettingsEventInput = {
  event: string;
  enabled?: boolean;
  channels?: string[];
  mutedChannels?: string[];
};

export type UpdateNotificationSettingsEventResponse = {
  updateNotificationSettingsEvent: {
    success: boolean;
  };
};

export const useNotificationSettingsEventUpdate = () => {
  const { toast } = useToast();
  const { t } = useTranslation('common', { keyPrefix: 'notification' });

  const [mutate, { data, loading, error }] = useMutation<
    UpdateNotificationSettingsEventResponse,
    { input: NotificationSettingsEventInput }
  >(UPDATE_NOTIFICATION_SETTINGS_EVENT);

  const updateNotificationSettingsEvent = async (
    input: NotificationSettingsEventInput,
  ) => {
    const { event, ...fields } = input;

    return mutate({
      variables: { input },
      // toggles move instantly; Apollo rolls this back if the save fails
      optimisticResponse: { updateNotificationSettingsEvent: { success: true } },
      update(cache) {
        cache.updateQuery<NotificationSettingsResponse>(
          { query: NOTIFICATION_SETTINGS },
          (current) => {
            if (!current?.notificationSettings) {
              return current;
            }

            const events = current.notificationSettings.events || {};
            const definedFields = Object.fromEntries(
              Object.entries(fields).filter(([, value]) => value !== undefined),
            );

            return {
              notificationSettings: {
                ...current.notificationSettings,
                events: {
                  ...events,
                  [event]: { ...events[event], ...definedFields },
                },
              },
            };
          },
        );
      },
      refetchQueries: [NOTIFICATION_SETTINGS],
      onError(e) {
        toast({
          title: t('settings-not-saved'),
          description: e.message,
          variant: 'destructive',
        });
      },
    });
  };

  return {
    updateNotificationSettingsEvent,
    data,
    loading,
    error,
  };
};
