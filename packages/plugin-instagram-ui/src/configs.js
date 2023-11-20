module.exports = {
  srcDir: __dirname,
  name: 'instagram',
  port: 3037,
  scope: 'instagram',
  exposes: {
    './routes': './src/routes.tsx',
    './inboxIntegrationSettings': './src/containers/UpdateConfigsContainer.tsx',
    './activityLog': './src/containers/ActivityLogsContainer.tsx',
    './inboxConversationDetailRespondBoxMask':
      './src/containers/TagMessageContainer.tsx'
  },
  routes: {
    url: 'http://localhost:3037/remoteEntry.js',
    scope: 'instagram',
    module: './routes'
  },
  inboxIntegrationSettings: './inboxIntegrationSettings',
  inboxDirectMessage: {
    messagesQuery: {
      query: `
          query instagramConversationMessages(
            $conversationId: String!
            $skip: Int
            $limit: Int
            $getFirst: Boolean
          ) {
            instagramConversationMessages(
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
      name: 'instagramConversationMessages',
      integrationKind: 'instagram-messenger'
    },
    countQuery: {
      query: `
          query instagramConversationMessagesCount($conversationId: String!) {
            instagramConversationMessagesCount(conversationId: $conversationId)
          }
        `,
      name: 'instagramConversationMessagesCount',
      integrationKind: 'instagram-messenger'
    }
  },
  inboxIntegrations: [
    {
      name: 'Instagram Messenger',
      description:
        'Connect and manage Instagram Messages right from your Team Inbox',
      inMessenger: false,
      isAvailable: true,
      kind: 'instagram-messenger',
      logo: '/images/integrations/instagram.png',
      createModal: 'instagram-messenger',
      createUrl: '/settings/integrations/createInstagram',
      category:
        'All integrations, For support teams, Messaging, Social media, Conversation',
      components: ['inboxConversationDetailRespondBoxMask']
    }
  ],
  activityLog: './activityLog',
  inboxConversationDetailRespondBoxMask:
    './inboxConversationDetailRespondBoxMask',
  inboxConversationDetail: './inboxConversationDetail'
};
