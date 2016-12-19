import { GraphQLScalarType } from 'graphql';
import { Kind } from 'graphql/language';
import { Conversations, Messages } from './connectors';

const resolveFunctions = {
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
};

export default resolveFunctions;
