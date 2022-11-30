import customScalars from '@erxes/api-utils/src/customScalars';

import mutations from './mutations';
import queries from './queries';
import FacebookConversationMessage from './conversationMessage';

const resolvers: any = async _serviceDiscovery => ({
  ...customScalars,
  FacebookConversationMessage,
  Mutation: {
    ...mutations
  },
  Query: {
    ...queries
  }
});

export default resolvers;
