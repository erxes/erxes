module.exports = {
  srcDir: __dirname,
  name: 'whatsapp',
  port: 3038,
  scope: 'whatsapp',
  exposes: {
    './routes': './src/routes.tsx',
    './inboxIntegrationSettings': './src/containers/UpdateConfigsContainer.tsx',
    './activityLog': './src/containers/ActivityLogsContainer.tsx',
    './inboxConversationDetailRespondBoxMask':
      './src/containers/TagMessageContainer.tsx'
  },
  routes: {
    url: 'http://localhost:3038/remoteEntry.js',
    scope: 'whatsapp',
    module: './routes'
  },
  inboxIntegrationSettings: './inboxIntegrationSettings',
  inboxDirectMessage: {
    messagesQuery: {
      query: `
          query whatsappConversationMessages(
            $conversationId: String!
            $skip: Int
            $limit: Int
            $getFirst: Boolean
          ) {
            whatsappConversationMessages(
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
      name: 'whatsappConversationMessages',
      integrationKind: 'whatsapp-messenger'
    },
    countQuery: {
      query: `
          query whatsappConversationMessagesCount($conversationId: String!) {
            whatsappConversationMessagesCount(conversationId: $conversationId)
          }
        `,
      name: 'whatsappConversationMessagesCount',
      integrationKind: 'whatsapp-messenger'
    }
  },
  inboxIntegrations: [
    {
      name: 'Instagram Post',
      description: 'Connect to Instagram posts right from your Team Inbox',
      inMessenger: false,
      isAvailable: true,
      kind: 'whatsapp-post',
      logo: '/images/integrations/whatsapp.png',
      createModal: 'whatsapp-post',
      createUrl: '/settings/integrations/createInstagram',
      category:
        'All integrations, For support teams, Marketing automation, Social media',
      components: ['inboxConversationDetailRespondBoxMask']
    },
    {
      name: 'Instagram Messenger',
      description:
        'Connect and manage Instagram Messages right from your Team Inbox',
      inMessenger: false,
      isAvailable: true,
      kind: 'whatsapp-messenger',
      logo: '/images/integrations/whatsapp.png',
      createModal: 'whatsapp-messenger',
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
