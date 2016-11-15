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
      name: 'conversationAddComment',
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

Notifications.registerModule(Conversations);
Notifications.registerModule(Channels);
