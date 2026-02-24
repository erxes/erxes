import { gql } from '@apollo/client';

export const UPDATE_NOTIFICATION_SETTINGS_EVENT = gql`
  mutation UpdateNotificationSettingsEvent(
    $input: NotificationSettingsEventInput
  ) {
    updateNotificationSettingsEvent(input: $input)
  }
`;
