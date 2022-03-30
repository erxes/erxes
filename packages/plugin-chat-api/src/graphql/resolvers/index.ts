import customScalars from '@erxes/api-utils/src/customScalars';
import Mutation from './mutations';
import Query from './queries';
import chat from './chat';
import chatMessage from './chatMessage';

const resolvers: any = async () => ({
  ...customScalars,

  chat,
  chatMessage,

  Mutation,
  Query,
});

export default resolvers;
