module.exports = {
  name: 'facebook',
  port: 3017,
  scope: 'facebook',
  exposes: {
    './routes': './src/routes.tsx',
    './inboxIntegrationSettings': './src/containers/UpdateConfigsContainer.tsx',
    './activityLog': './src/containers/ActivityLogsContainer.tsx',
    './inboxConversationDetailRespondBoxMask':
      './src/containers/TagMessageContainer.tsx',
    './inboxConversationDetail':
      './src/containers/post/FbCommentsContainer.tsx',
  },
  routes: {
    url: 'http://localhost:3017/remoteEntry.js',
    scope: 'facebook',
    module: './routes',
  },
  inboxIntegrationSettings: './inboxIntegrationSettings',
  inboxDirectMessage: {
    messagesQuery: {
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
              internal

              attachments {
                url
                name
                type
                size
              }

              user {
                _id
                username
                details {
                  avatar
                  fullName
                  position
                }
              }

              customer {
                _id
                avatar
                firstName
                middleName
                lastName
                primaryEmail
                primaryPhone
                state

                companies {
                  _id
                  primaryName
                  website
                }

                customFieldsData
                tagIds
              }
            }
          }
        `,
      name: 'facebookConversationMessages',
      integrationKind: 'facebook-messenger',
    },
    countQuery: {
      query: `
          query facebookConversationMessagesCount($conversationId: String!) {
            facebookConversationMessagesCount(conversationId: $conversationId)
          }
        `,
      name: 'facebookConversationMessagesCount',
      integrationKind: 'facebook-messenger',
    },
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
      components: ['inboxConversationDetail'],
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
      components: ['inboxConversationDetailRespondBoxMask'],
    },
  ],
  activityLog: './activityLog',
  inboxConversationDetailRespondBoxMask:
    './inboxConversationDetailRespondBoxMask',
  inboxConversationDetail: './inboxConversationDetail',
};
