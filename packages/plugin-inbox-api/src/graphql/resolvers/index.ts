import customScalars from '@erxes/api-utils/src/customScalars';
import ConversationMutations from './conversationMutations';
import ConversationQueries from './conversationQueries';
import Conversation from './conversation';
import ConversationMessage from './conversationMessage';

const resolvers: any = {
  ...customScalars,
  Conversation,
  ConversationMessage,
  Mutation: {
    ...ConversationMutations,
  },
  Query: {
    ...ConversationQueries,
  }
};

export default resolvers;