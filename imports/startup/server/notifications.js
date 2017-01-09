import { Notifications } from 'meteor/erxes-notifications';

const Conversations = {
  name: 'conversations',
  description: 'Conversations',
  types: [
    {
      name: 'conversationStateChange',
      text: 'State change',
    },
    {
      name: 'conversationAssigneeChange',
      text: 'Assignee change',
    },
    {
      name: 'conversationAddMessage',
      text: 'Add message',
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

Notifications.registerModule(Conversations);
Notifications.registerModule(Channels);
