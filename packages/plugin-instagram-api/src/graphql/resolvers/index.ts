import customScalars from '@erxes/api-utils/src/customScalars';

import mutations from './mutations';
import queries from './queries';
import InstagramConversationMessage from './conversationMessage';
import InstagramComment from './comment';

const resolvers: any = async _serviceDiscovery => ({
  ...customScalars,
  InstagramConversationMessage,
  InstagramComment,
  Mutation: {
    ...mutations
  },
  Query: {
    ...queries
  }
});

export default resolvers;
