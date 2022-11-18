module.exports = {
  name: 'facebook',
  port: 3017,
  scope: 'facebook',
  exposes: {
    './routes': './src/routes.tsx',
    './inboxIntegrationSettings': './src/containers/UpdateConfigsContainer.tsx',
    './activityLog': './src/containers/ActivityLogsContainer'
  },
  routes: {
    url: 'http://localhost:3017/remoteEntry.js',
    scope: 'facebook',
    module: './routes',
  },
  inboxIntegrationSettings: './inboxIntegrationSettings',
  inboxDirectMessage: {
    messagesQuery: `
      query facebookConversationMessages(
        $conversationId: String!
        $skip: Int
        $limit: Int
        $getFirst: Boolean
      ) {
        facebookConversationMessages(
          conversationId: $conversationId,
          skip: $skip,
          limit: $limit,
          getFirst: $getFirst
        ) {
          _id
          content
          conversationId
          customerId
          userId
          createdAt
          isCustomerRead
        }
      }
    `,
    messagesQueryName: 'facebookConversationMessages',
    countQuery: `
      query facebookConversationMessagesCount($conversationId: String!) {
        facebookConversationMessagesCount(conversationId: $conversationId)
      }
    `,
    countQueryName: 'facebookConversationMessagesCount'
  },
  inboxIntegrations: [
    {
      name: 'Facebook Post',
      description: 'Connect to Facebook posts right from your Team Inbox',
      inMessenger: false,
      isAvailable: true,
      kind: 'facebook-post',
      logo: '/images/integrations/facebook.png',
      createModal: 'facebook-post',
      createUrl: '/settings/integrations/createFacebook',
      category:
        'All integrations, For support teams, Marketing automation, Social media',
    },
    {
      name: 'Facebook Messenger',
      description:
        'Connect and manage Facebook Messages right from your Team Inbox',
      inMessenger: false,
      isAvailable: true,
      kind: 'facebook-messenger',
      logo: '/images/integrations/fb-messenger.png',
      createModal: 'facebook-messenger',
      createUrl: '/settings/integrations/createFacebook',
      category:
        'All integrations, For support teams, Messaging, Social media, Conversation',
    },
  ],
  activityLog: './activityLog'
};
