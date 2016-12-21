import { GraphQLScalarType } from 'graphql';
import { makeExecutableSchema } from 'graphql-tools';
import { Kind } from 'graphql/language';
import { Conversations, Messages } from './connectors';
import { pubsub } from './subscriptions';

const typeDefs = `
  scalar Date

  type Attachment {
    url: String
    name: String
    type: String
    size: Int
  }

  type Conversation {
    _id: String!
    content: String
  }

  type Message {
    _id: String!
    conversationId: String!
    content: String
    createdAt: Date
    attachments: [Attachment]
  }

  # the schema allows the following two queries:
  type RootQuery {
    conversations: [Conversation]
    messages(conversationId: String): [Message]
  }

	type Mutation {
    simulateInsertMessage(messageId: String): Message
  }

	type Subscription {
		messageInserted: Message
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
  },

  Mutation: {
    simulateInsertMessage(root, args) {
      const message = Messages.findOne({ _id: args.messageId });

      pubsub.publish('messageInserted', message);

      return message;
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
