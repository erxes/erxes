import customScalars from '@erxes/api-utils/src/customScalars';

import mutations from './mutations';
import queries from './queries';
import whatsAPPConversationMessage from './conversationMessage';

const resolvers: any = async () => ({
  ...customScalars,
  whatsAPPConversationMessage,
  Mutation: {
    ...mutations
  },
  Query: {
    ...queries
  }
});

export default resolvers;
