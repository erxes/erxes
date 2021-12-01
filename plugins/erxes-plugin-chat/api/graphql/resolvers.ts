import chatResolvers from '../resolvers/chat';
import chatMessageResolvers from '../resolvers/chatMessage';

export default [...chatResolvers, ...chatMessageResolvers];
