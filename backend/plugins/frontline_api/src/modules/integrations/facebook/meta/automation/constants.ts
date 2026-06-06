const facebookMessageTriggerOutput = {
  variables: [
    { key: '_id', label: 'Message ID' },
    { key: 'mid', label: 'Facebook MID' },
    { key: 'content', label: 'Message content' },
    { key: 'conversationId', label: 'Conversation ID' },
    { key: 'customerId', label: 'Customer ID' },
    { key: 'botId', label: 'Bot ID' },
    { key: 'entryType', label: 'Entry type' },
    { key: 'payload.btnId', label: 'Button ID' },
    { key: 'payload.executionId', label: 'Payload execution ID' },
    { key: 'payload.actionId', label: 'Payload action ID' },
    { key: 'openThread.source', label: 'Open thread source' },
    { key: 'openThread.type', label: 'Open thread type' },
    { key: 'openThread.adId', label: 'Ad ID' },
    { key: 'openThread.postId', label: 'Post ID' },
    { key: 'openThread.pageId', label: 'Page ID' },
  ],
};

const facebookCommentTriggerOutput = {
  variables: [
    { key: '_id', label: 'Comment conversation ID' },
    { key: 'mid', label: 'Facebook MID' },
    { key: 'comment_id', label: 'Facebook comment ID' },
    { key: 'postId', label: 'Post ID' },
    { key: 'parentId', label: 'Parent comment ID' },
    { key: 'content', label: 'Comment content' },
    { key: 'conversationId', label: 'Inbox conversation ID' },
    { key: 'erxesApiId', label: 'erxes conversation ID' },
    { key: 'customerId', label: 'Customer ID' },
    { key: 'recipientId', label: 'Page ID' },
    { key: 'senderId', label: 'Sender ID' },
  ],
};

const getFirstMessageValue = (source: Record<string, any>, path: string) => {
  const messages = Array.isArray(source) ? source : source?.result;
  const firstMessage = Array.isArray(messages) ? messages[0] : messages;

  if (!firstMessage) {
    return undefined;
  }

  switch (path) {
    case 'messageId':
      return firstMessage._id;
    case 'facebookMid':
      return firstMessage.mid;
    case 'content':
      return firstMessage.content;
    case 'conversationId':
      return firstMessage.conversationId;
    case 'customerId':
      return firstMessage.customerId;
    case 'botId':
      return firstMessage.botId;
    default:
      return undefined;
  }
};

const facebookMessageActionOutput = {
  variables: [
    { key: 'messageId', label: 'Sent message ID' },
    { key: 'facebookMid', label: 'Sent Facebook MID' },
    { key: 'content', label: 'Sent message content' },
    { key: 'conversationId', label: 'Conversation ID' },
    { key: 'customerId', label: 'Customer ID' },
    { key: 'botId', label: 'Bot ID' },
  ],
  resolvers: {
    messageId: async ({ source, path }) => getFirstMessageValue(source, path),
    facebookMid: async ({ source, path }) => getFirstMessageValue(source, path),
    content: async ({ source, path }) => getFirstMessageValue(source, path),
    conversationId: async ({ source, path }) =>
      getFirstMessageValue(source, path),
    customerId: async ({ source, path }) => getFirstMessageValue(source, path),
    botId: async ({ source, path }) => getFirstMessageValue(source, path),
  },
};

const facebookCommentActionOutput = {
  variables: [{ key: 'status', label: 'Reply status' }],
};

export const facebookConstants = {
  actions: [
    {
      moduleName: 'facebook',
      collectionName: 'messages',
      method: 'create',
      icon: 'IconBrandMessenger',
      label: 'Send Facebook Message',
      description: 'Send Facebook Message',
      isAvailableOptionalConnect: true,
      output: facebookMessageActionOutput,
    },
    {
      moduleName: 'facebook',
      collectionName: 'comments',
      method: 'create',
      icon: 'IconBrandFacebook',
      label: 'Send Facebook Comment',
      description: 'Send Facebook Comments',
      output: facebookCommentActionOutput,
    },
  ],
  triggers: [
    {
      moduleName: 'facebook',
      collectionName: 'messages',
      icon: 'IconBrandMessenger',
      label: 'Facebook Message',
      description:
        'Start with a blank workflow that enrolls and is triggered off facebook messages',
      isCustom: true,
      output: facebookMessageTriggerOutput,
    },
    {
      moduleName: 'facebook',
      collectionName: 'comments',
      icon: 'IconBrandFacebook',
      label: 'Facebook Comments',
      description:
        'Start with a blank workflow that enrolls and is triggered off facebook comments',
      isCustom: true,
      output: facebookCommentTriggerOutput,
    },
  ],
  bots: [
    {
      moduleName: 'facebook',
      name: 'facebook-messenger-bots',
      label: 'Facebook Messenger',
      description: 'Generate Facebook Messenger Bots',
      logo: 'fb-messenger.webp',
      totalCountQueryName: 'facebookMessengerBotsTotalCount',
    },
  ],
};
