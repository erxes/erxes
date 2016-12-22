import { GraphQLScalarType } from 'graphql';
import { makeExecutableSchema } from 'graphql-tools';
import { Kind } from 'graphql/language';
import { Conversations, Messages, Users } from './connectors';
import { pubsub } from './subscriptions';

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

  # conversation ===========
  type Conversation {
    _id: String!
    content: String
  }

  type Message {
    _id: String!
    conversationId: String!
    user: User
    content: String
    createdAt: Date
    attachments: [Attachment]
  }

  # the schema allows the following two queries:
  type RootQuery {
    conversations: [Conversation]
    messages(conversationId: String): [Message]
    unreadCount(conversationId: String): Int
    totalUnreadCount: Int
    conversationLastStaff(_id: String): User
  }

  type Mutation {
    simulateInsertMessage(messageId: String): Message
    readConversationMessages(conversationId: String): String
  }

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
  Date: new GraphQLScalarType({
    name: 'Date',

    description: 'Date custom scalar type',

    parseValue(value) {
      return new Date(value); // value from the client
    },

    serialize(value) {
      return value.getTime(); // value sent to the client
    },

    parseLiteral(ast) {
      if (ast.kind === Kind.INT) {
        return parseInt(ast.value, 10); // ast value is always in string format
      }
      return null;
    },
  }),

  RootQuery: {
    conversations() {
      return Conversations.find({});
    },

    messages(_, { conversationId }) {
      return Messages.find({ conversationId });
    },

    unreadCount(_, { conversationId }) {
      return Messages.count({
        conversationId,
        userId: { $exists: true },
        isCustomerRead: { $exists: false },
      });
    },

    totalUnreadCount() {
      return Messages.count({
        userId: { $exists: true },
        isCustomerRead: { $exists: false },
      });
    },

    conversationLastStaff(_, args) {
      const messageQuery = {
        conversationId: args._id,
        userId: { $exists: true },
      };

      return Messages.findOne(messageQuery).then((message) =>
        Users.findOne({ _id: message && message.userId })
      );
    },
  },

  Message: {
    user(root) {
      return Users.findOne({ _id: root.userId });
    },
  },

  Mutation: {
    simulateInsertMessage(root, args) {
      const message = Messages.findOne({ _id: args.messageId });

      pubsub.publish('messageInserted', message);
      pubsub.publish('notification');

      return message;
    },

    /*
     * mark given conversation's messages as read
     */
    readConversationMessages(root, args) {
      return Messages.update(
        {
          conversationId: args.conversationId,
          userId: { $exists: true },
          isCustomerRead: { $exists: false },
        },
        { isCustomerRead: true },
        { multi: true },

        () => {
          // notify all notification subscribers that message's read
          // state changed
          pubsub.publish('notification');
        }
      );
    },
  },

  Subscription: {
    messageInserted(message) {
      return message;
    },
  },
};

const executableSchema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

export default executableSchema;
