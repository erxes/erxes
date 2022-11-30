module.exports = {
  name: 'facebook',
  port: 3017,
  scope: 'facebook',
  exposes: {
    './routes': './src/routes.tsx',
    './inboxIntegrationSettings': './src/containers/UpdateConfigsContainer.tsx',
    './activityLog': './src/containers/ActivityLogsContainer.tsx',
    './inboxConversationDetailRespondBoxMask': './src/containers/TagMessageContainer.tsx',
    './specialConversationUi': './src/containers/post/FbCommentsContainer.tsx'
  },
  routes: {
    url: 'http://localhost:3017/remoteEntry.js',
    scope: 'facebook',
    module: './routes',
  },
  inboxIntegrationSettings: './inboxIntegrationSettings',
  inboxDirectMessage: {
    messagesQueries: [
      {
        query: `
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

              attachments {
                url
                name
                type
                size
              }
            }
          }
        `,
        name: 'facebookConversationMessages',
        integrationKind: 'facebook-messenger'
      },
      {
        query: `
          query facebookGetComments($conversationId: String!, $isResolved: Boolean, $commentId: String, $senderId: String, $skip: Int, $limit: Int) {
            facebookGetComments(conversationId: $conversationId, isResolved: $isResolved, commentId: $commentId, senderId: $senderId, skip: $skip, limit: $limit) {
              conversationId
              commentId
              postId
              parentId
              recipientId
              senderId
              permalink_url
              attachments
              content
              erxesApiId
              timestamp
              customer {
                _id
              }
              commentCount
              isResolved
            }
          }
        `,
        name: 'facebookGetComments',
        integrationKind: 'facebook-post'
      }
    ],
    countQueries: [
      {
        query: `
          query facebookConversationMessagesCount($conversationId: String!) {
            facebookConversationMessagesCount(conversationId: $conversationId)
          }
        `,
        name: 'facebookConversationMessagesCount',
        integrationKind: 'facebook-messenger'
      },
      {
        query: `
          query facebookGetCommentCount($conversationId: String!, $isResolved: Boolean) {
            facebookGetCommentCount(conversationId: $conversationId, isResolved: $isResolved)
          }
        `,
        name: 'facebookGetCommentCount',
        integrationKind: 'facebook-post'
      }
    ],
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
      components: ['specialConversationUi']
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
      components: ['inboxConversationDetailRespondBoxMask']
    },
  ],
  activityLog: './activityLog',
  inboxConversationDetailRespondBoxMask: './inboxConversationDetailRespondBoxMask',
  specialConversationUi: './specialConversationUi'
};
