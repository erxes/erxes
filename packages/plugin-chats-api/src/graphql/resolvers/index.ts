import customScalars from '@erxes/api-utils/src/customScalars';
import Mutation from './mutations';
import Query from './queries';
import Chat from './chat';
import ChatMessage from './chatMessage';
import ChatMessageReaction from './chatMessageReaction';

const resolvers: any = async () => ({
  ...customScalars,

  Chat,
  ChatMessage,
  ChatMessageReaction,

  Mutation,
  Query,
});

export default resolvers;
