import { makeExecutableSchema } from 'graphql-tools';
import queries from './queries';
import mutations from './mutations';
import subscriptions from './subscriptions';
import customTypes from './custom-types';

const typeDefs = `
  scalar Date

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

  # the schema allows the following two queries:
  type RootQuery {
    conversations(brandCode: String!, email: String!): [Conversation]
    messages(conversationId: String): [Message]
    unreadCount(conversationId: String): Int
    totalUnreadCount: Int
    conversationLastStaff(_id: String): User
  }

  type Mutation {
    simulateInsertMessage(messageId: String): Message

    insertMessage(brandCode: String!, email: String!, conversationId: String!
      message: String, attachments: [AttachmentInput]): Message

    readConversationMessages(conversationId: String): String
  }

  # subscriptions
  type Subscription {
    messageInserted: Message
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
  ...queries,
  ...mutations,
  ...subscriptions,
};

const executableSchema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

export default executableSchema;
