module.exports = {
  name: 'zalo',
  scope: 'zalo',
  port: 3025,
  exposes: {
    './routes': './src/routes.tsx',
    './inboxIntegrationSettings': './src/containers/IntergrationConfigs.tsx',
    './inboxConversationDetail': './src/components/ConversationDetail.tsx'
  },
  routes: {
    url: 'http://localhost:3025/remoteEntry.js',
    scope: 'zalo',
    module: './routes'
  },
  inboxIntegrationSettings: './inboxIntegrationSettings',
  inboxConversationDetail: './inboxConversationDetail',
  inboxDirectMessage: {
    messagesQuery: {
      query: `
        query zaloConversationMessages(
          $conversationId: String!
          $skip: Int
          $limit: Int
          $getFirst: Boolean
        ) {
          zaloConversationMessages(
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
              thumbnail
              type
              url
              name
              description
              duration
              coordinates
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
      name: 'zaloConversationMessages',
      integrationKind: 'zalo'
    },
    countQuery: {
      query: `
        query zaloConversationMessagesCount($conversationId: String!) {
          zaloConversationMessagesCount(conversationId: $conversationId)
        }
      `,
      name: 'zaloConversationMessagesCount',
      integrationKind: 'zalo'
    },
  },
  inboxIntegrations: [
    {
      name: 'Zalo',
      description:
        'Please write integration description on plugin config file',
      isAvailable: true,
      kind: 'zalo',
      logo: '/images/integrations/zalo.png',
      createUrl: '/settings/integrations/createZalo',
      category:
        'All integrations, For support teams, Marketing automation, Email marketing',
      // components: ['inboxConversationDetail']
    }
  ]
};
