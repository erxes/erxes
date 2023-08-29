module.exports = {
  name: "viber",
  scope: "viber",
  port: 3024,
  exposes: {
    "./routes": "./src/routes.tsx",
    "./inboxIntegrationForm": "./src/components/IntegrationForm.tsx",
    "./inboxConversationDetail": "./src/components/ConversationDetail.tsx",
    "./integrationDetailsForm": "./src/components/IntegrationEditForm.tsx",
  },
  routes: {
    url: "http://localhost:3024/remoteEntry.js",
    scope: "viber",
    module: "./routes",
  },
  inboxDirectMessage: {
    messagesQuery: {
      query: `
        query viberConversationMessages(
          $conversationId: String!
          $skip: Int
          $limit: Int
          $getFirst: Boolean
        ) {
          viberConversationMessages(
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
      name: "viberConversationMessages",
      integrationKind: "viber",
    },

    countQuery: {
      query: `
        query viberConversationMessagesCount($conversationId: String!) {
          viberConversationMessagesCount(conversationId: $conversationId)
        }
      `,
      name: "viberConversationMessagesCount",
      integrationKind: "viber",
    },
  },
  inboxIntegrationForm: "./inboxIntegrationForm",
  invoiceDetailRightSection: "./invoiceDetailRightSection",
  integrationDetailsForm: "./integrationDetailsForm",
  inboxIntegrations: [
    {
      name: "Viber",
      description: "Configure Viber application",
      isAvailable: true,
      kind: "viber",
      logo: "/images/integrations/viber.png",
      createModal: "viber",
    },
  ],
};
