module.exports = {
  name: "dailyco",
  scope: "dailyco",
  port: 3024,
  exposes: {
    "./routes": "./src/routes.tsx",
    "./inboxIntegrationForm": "./src/components/IntegrationForm.tsx",
    "./inboxConversationDetail": "./src/components/ConversationDetail.tsx",
    "./integrationDetailsForm": "./src/components/IntegrationEditForm.tsx",
  },
  routes: {
    url: "http://localhost:3024/remoteEntry.js",
    scope: "dailyco",
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
      integrationKind: "dailyco",
    },

    countQuery: {
      query: `
        query viberConversationMessagesCount($conversationId: String!) {
          viberConversationMessagesCount(conversationId: $conversationId)
        }
      `,
      name: "viberConversationMessagesCount",
      integrationKind: "dailyco",
    },
  },

  invoiceDetailRightSection: "./invoiceDetailRightSection",
  integrationDetailsForm: "./integrationDetailsForm",
};
