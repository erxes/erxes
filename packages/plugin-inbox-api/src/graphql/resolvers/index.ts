import customScalars from '@erxes/api-utils/src/customScalars';
import Mutation from './Mutation';
import Query from './Query';
import Conversation from './conversation';
import ConversationMessage from './conversationMessage';

const resolvers: any = {
  ...customScalars,
  Conversation,
  ConversationMessage,
  Mutation,
  Query
};

export default resolvers;