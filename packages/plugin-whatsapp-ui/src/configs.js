module.exports = {
  srcDir: __dirname,
  name: "whatsapp",
  port: 3038,
  scope: "whatsapp",
  exposes: {
    "./routes": "./src/routes.tsx",
    "./inboxIntegrationSettings": "./src/containers/UpdateConfigsContainer.tsx",
    "./activityLog": "./src/containers/ActivityLogsContainer.tsx",
    "./inboxConversationDetailRespondBoxMask":
      "./src/containers/TagMessageContainer.tsx",
    "./automation": "./src/automations/index.tsx",
    "./messenger-bots": "./src/automations/bots/containers/List.tsx"
  },
  routes: {
    url: "http://localhost:3038/remoteEntry.js",
    scope: "whatsapp",
    module: "./routes"
  },
  automation: "./automation",
  automationBots: [
    {
      name: "WhatsApp-bots",
      label: "WhatsApp",
      description: "Generate WhatsApp Bots",
      logo: "/images/integrations/whatsapp.png",
      list: "./messenger-bots",
      createUrl: "/settings/whatsapp-messenger-bot/create",
      totalCountQuery:
        "query WhatsappBootMessengerBotsTotalCount {  whatsappBootMessengerBotsTotalCount }"
    }
  ],
  inboxIntegrationSettings: "./inboxIntegrationSettings",
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
              botData

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
      name: "whatsappConversationMessages",
      integrationKind: "whatsapp"
    },
    countQuery: {
      query: `
          query whatsappConversationMessagesCount($conversationId: String!) {
            whatsappConversationMessagesCount(conversationId: $conversationId)
          }
        `,
      name: "whatsappConversationMessagesCount",
      integrationKind: "whatsapp"
    }
  },
  inboxIntegrations: [
    {
      name: "Whats App",
      description: "Connect and manage Whats App right from your Team Inbox",
      inMessenger: false,
      isAvailable: true,
      kind: "whatsapp",
      logo: "/images/integrations/whatsapp.png",
      createModal: "whatsapp",
      createUrl: "/settings/integrations/createWhatsapp",
      category:
        "All integrations, For support teams, Messaging, Social media, Conversation",
      components: ["inboxConversationDetailRespondBoxMask"]
    }
  ],
  activityLog: "./activityLog",
  inboxConversationDetailRespondBoxMask:
    "./inboxConversationDetailRespondBoxMask",
  inboxConversationDetail: "./inboxConversationDetail"
};
