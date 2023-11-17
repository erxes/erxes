module.exports = {
  srcDir: __dirname,
  name: 'instagram',
  port: 3017,
  scope: 'instagram',
  exposes: {
    './routes': './src/routes.tsx',
    './inboxIntegrationSettings': './src/containers/UpdateConfigsContainer.tsx',
    './activityLog': './src/containers/ActivityLogsContainer.tsx',
    './inboxConversationDetailRespondBoxMask':
      './src/containers/TagMessageContainer.tsx',
    './inboxConversationDetail': './src/containers/post/FbCommentsContainer.tsx'
  },
  routes: {
    url: 'http://localhost:3017/remoteEntry.js',
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
      name: 'Instagram Post',
      description: 'Connect to Instagram posts right from your Team Inbox',
      inMessenger: false,
      isAvailable: true,
      kind: 'instagram-post',
      logo: '/images/integrations/instagram.png',
      createModal: 'instagram-post',
      createUrl: '/settings/integrations/createInstagram',
      category:
        'All integrations, For support teams, Marketing automation, Social media',
      components: ['inboxConversationDetail']
    },
    {
      name: 'Instagram Messenger',
      description:
        'Connect and manage Instagram Messages right from your Team Inbox',
      inMessenger: false,
      isAvailable: true,
      kind: 'instagram-messenger',
      logo: '/images/integrations/fb-messenger.png',
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
