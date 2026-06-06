import { gql } from '@apollo/client';

export const NOTIFICATION_PLUGINS_TYPES = gql`
  query NotificationPlugins {
    pluginsNotifications {
      pluginName
      modules {
        name
        description
        icon
        events {
          name
          title
          description
        }
      }
    }
  }
`;

export const NOTIFICATION_SETTINGS = gql`
  query NotificationSettings {
    notificationSettings {
      userId
      events
      channels
      createdAt
      updatedAt
    }
  }
`;
