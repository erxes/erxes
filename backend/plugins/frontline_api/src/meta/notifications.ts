import {
  INotificationsConfig,
  TNotificationEventKey,
} from 'erxes-api-shared/core-modules';

export const notifications = {
  plugin: 'frontline',

  modules: [
    {
      name: 'conversations',
      description: 'Conversations',
      icon: 'IconComment',

      events: [
        {
          name: 'conversationAddMessage',
          title: 'Message added',
          description: 'Triggered when a message is added to a conversation',
          // agents had a push for every chat message before it was a preference
          defaultChannels: ['mobile'],
        },
        {
          name: 'conversationAssigneeChange',
          title: 'Assignee changed',
          description: 'Triggered when a conversation assignee is changed',
        },
        {
          name: 'conversationMention',
          title: 'Mentioned in internal note',
          description:
            'Triggered when a user is mentioned in a conversation internal note',
        },
        {
          name: 'conversationStateChange',
          title: 'State changed',
          description: 'Triggered when a conversation state is changed',
        },
      ],
    },
    {
      name: 'tickets',
      description: 'Tickets',
      icon: 'IconTicket',

      events: [
        {
          name: 'ticketAssignee',
          title: 'Ticket assigned',
          description: 'Triggered when a user is assigned to a ticket',
        },
        {
          name: 'ticketUpdated',
          title: 'Ticket updated',
          description: 'Triggered when a ticket you follow is updated',
        },
        {
          name: 'ticketMention',
          title: 'Mentioned in ticket note',
          description: 'Triggered when a user is mentioned in a ticket note',
        },
        {
          name: 'ticketCustomerReply',
          title: 'Customer replied',
          description: 'Triggered when a customer replies to a ticket you follow',
        },
      ],
    },
    {
      name: 'integrations',
      description: 'Integrations',
      icon: 'IconPlug',

      events: [
        {
          name: 'integrationHealthBroken',
          title: 'Connection broken',
          description:
            'Triggered when an integration loses access to its provider',
        },
      ],
    },
    {
      name: 'channels',
      description: 'Channels',
      icon: 'IconDeviceLaptop',

      events: [
        {
          name: 'channelMembersChange',
          title: 'Assignee change',
          description: 'Triggered when a channel member is changed',
        },
      ],
    },
  ],
} as const satisfies INotificationsConfig;

export type TFrontlineNotificationEvent = TNotificationEventKey<
  typeof notifications
>;
