import { Notifications } from 'meteor/erxes-notifications';

const Tickets = {
  name: 'tickets',
  description: 'Tickets',
  types: [
    {
      name: 'ticketStateChange',
      text: 'State change',
    },
    {
      name: 'ticketAssigneeChange',
      text: 'Assignee change',
    },
    {
      name: 'ticketAddComment',
      text: 'Add comment',
    },
  ],
};

const Channels = {
  name: 'channels',
  description: 'Channels',
  types: [
    {
      name: 'channelMembersChange',
      text: 'Members change',
    },
  ],
};

Notifications.registerModule(Tickets);
Notifications.registerModule(Channels);
