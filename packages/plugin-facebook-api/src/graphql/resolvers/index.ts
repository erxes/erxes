import customScalars from '@erxes/api-utils/src/customScalars';

import mutations from './mutations';
import queries from './queries';
import FacebookConversationMessage from './conversationMessage';
import FacebookComment from './comment';

const resolvers: any = async _serviceDiscovery => ({
  ...customScalars,
  FacebookConversationMessage,
  FacebookComment,
  Mutation: {
    ...mutations
  },
  Query: {
    ...queries
  }
});

export default resolvers;
