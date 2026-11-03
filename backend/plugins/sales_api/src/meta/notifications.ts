import {
  INotificationsConfig,
  TNotificationEventKey,
} from 'erxes-api-shared/core-modules';

export const notifications = {
  plugin: 'sales',

  modules: [
    {
      name: 'deals',
      description: 'Deals',
      icon: 'IconChecklist',

      events: [
        {
          name: 'dealAssignee',
          title: 'Deal assignee',
          description: 'Triggered when a user is assigned to a deal',
        },
        {
          name: 'dealUpdated',
          title: 'Deal updated',
          description: 'Triggered when a deal you are assigned to or watch is updated',
        },
        {
          name: 'dealStatus',
          title: 'Deal status changed',
          description: 'Triggered when a deal is archived or activated',
        },
      ],
    },
  ],
} as const satisfies INotificationsConfig;

export type TSalesNotificationEvent = TNotificationEventKey<
  typeof notifications
>;
