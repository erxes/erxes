const inboxMessageTriggerOutput = {
  variables: [
    { key: '_id', label: 'Message ID' },
    { key: 'content', label: 'Message content' },
    { key: 'conversationId', label: 'Conversation ID' },
    { key: 'customerId', label: 'Customer ID' },
    { key: 'botId', label: 'Bot ID' },
  ],
};

const inboxMessageActionOutput = {
  variables: [
    { key: '_id', label: 'Message ID' },
    { key: 'conversationId', label: 'Conversation ID' },
    { key: 'content', label: 'Message content' },
  ],
};

export const inboxConstants = {
  actions: [
    {
      moduleName: 'inbox',
      collectionName: 'messages',
      method: 'create',
      icon: 'IconMessage',
      label: 'Send Messenger Message',
      description: 'Send a message to the messenger widget conversation',
      isAvailableOptionalConnect: false,
      output: inboxMessageActionOutput,
    },
  ],
  triggers: [
    {
      moduleName: 'inbox',
      collectionName: 'messages',
      icon: 'IconMessage',
      label: 'Messenger Message',
      description:
        'Start with a blank workflow that enrolls and is triggered off messenger widget messages',
      isCustom: true,
      output: inboxMessageTriggerOutput,
    },
  ],
  bots: [],
};
