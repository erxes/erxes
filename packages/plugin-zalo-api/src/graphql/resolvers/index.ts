import customScalars from '@erxes/api-utils/src/customScalars';
import mutations from './mutations';
import queries from './queries';
import ZaloConversationMessage from './conversationMessages';

const resolvers: any = async () => ({
  ...customScalars,
  ZaloConversationMessage,
  Mutation: {
    ...mutations,
  },
  Query: {
    ...queries,
  },
});

export default resolvers;
