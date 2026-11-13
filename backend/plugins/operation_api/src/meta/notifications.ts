import {
  INotificationsConfig,
  TNotificationEventKey,
} from 'erxes-api-shared/core-modules';

export const notifications = {
  plugin: 'operation',

  modules: [
    {
      name: 'task',
      description: 'Task Notifications',
      icon: 'IconChecklist',

      events: [
        {
          name: 'taskAssignee',
          title: 'Task Assigned',
          description: 'Triggered when a user is assigned to a task',
        },
      ],
    },
    {
      name: 'note',
      description: 'Note Notifications',
      icon: 'IconNote',

      events: [
        {
          name: 'noteMention',
          title: 'Mentioned in note',
          description:
            'Triggered when a user is mentioned in a task, project or triage note',
        },
      ],
    },
    {
      name: 'triage',
      description: 'Triage Notifications',
      icon: 'IconInbox',

      events: [
        {
          name: 'triageCreated',
          title: 'Triage created',
          description: "Triggered when a triage is added to the user's team",
        },
      ],
    },
    {
      name: 'team',
      description: 'Team Notifications',
      icon: 'IconUsersGroup',

      events: [
        {
          name: 'teamMemberAdded',
          title: 'Added to team',
          description: 'Triggered when a user is added to a team',
        },
      ],
    },
  ],
} as const satisfies INotificationsConfig;

export type TOperationNotificationEvent = TNotificationEventKey<
  typeof notifications
>;
