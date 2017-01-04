import { makeExecutableSchema } from 'graphql-tools';
import inAppQueries from './inapp-queries';
import inAppMutations from './inapp-mutations';
import ChatMutations from './chat-mutations';
import subscriptions from './subscriptions';
import customTypes from './custom-types';

const typeDefs = `
  scalar Date
  scalar JSON

  # user ================
  type UserDetails {
    avatar: String
  }

  type User {
    _id: String!
    details: UserDetails
  }

  type Attachment {
    url: String
    name: String
    type: String
    size: Int
  }

  input AttachmentInput {
    url: String
    name: String
    type: String
    size: Int
  }

  # conversation ===========
  type Conversation {
    _id: String!
    customerId: String!
    integrationId: String!
    status: String!
    content: String
    readUserIds: [String]
  }

  type Message {
    _id: String!
    conversationId: String!
    customerId: String
    user: User
    content: String
    createdAt: Date
    attachments: [Attachment]
    internal: Boolean
  }

  # the schema allows the following queries:
  type RootQuery {
    conversations(integrationId: String!, customerId: String!): [Conversation]
    totalUnreadCount(integrationId: String!, customerId: String!): Int
    messages(conversationId: String): [Message]
    unreadCount(conversationId: String): Int
    conversationLastStaff(_id: String): User
  }

  type InAppConnectResponse {
    integrationId: String!
    customerId: String!
  }

  type Mutation {
    inAppConnect(brandCode: String!, email: String!, data: JSON): InAppConnectResponse
    insertMessage(integrationId: String!, customerId: String!,
      conversationId: String!, message: String, attachments: [AttachmentInput]): Message

    simulateInsertMessage(messageId: String): Message
    readConversationMessages(conversationId: String): String

    chatConnect(brandCode: String!): String
    chatCreateConversation(integrationId: String!, email: String!, content: String!): Message
  }

  # subscriptions
  type Subscription {
    messageInserted(conversationId: String!): Message
    notification: String
  }

  # we need to tell the server which types represent the root query
  # and root mutation types. We call them RootQuery and RootMutation by convention.
  schema {
    query: RootQuery
    subscription: Subscription
    mutation: Mutation
  }
`;

const resolvers = {
  ...customTypes,
  ...inAppQueries,
  ...subscriptions,
  Mutation: {
    ...inAppMutations,
    ...ChatMutations,
  },
};

const executableSchema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

export default executableSchema;
