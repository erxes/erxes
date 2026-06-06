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
        },
        {
          name: 'conversationAssigneeChange',
          title: 'Assignee changed',
          description: 'Triggered when a conversation assignee is changed',
        },
        {
          name: 'conversationCreated',
          title: 'Conversation created',
          description: 'Triggered when a conversation is created',
        },
        {
          name: 'conversationParticipantAdded',
          title: 'Participant added',
          description:
            'Triggered when a participant is added to a conversation',
        },
        {
          name: 'conversationStateChange',
          title: 'State changed',
          description: 'Triggered when a conversation state is changed',
        },
        {
          name: 'conversationTagged',
          title: 'Conversation tagged',
          description: 'Triggered when a conversation is tagged',
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
};
