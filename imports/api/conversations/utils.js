import { Conversations } from './conversations';
import { Messages } from './messages';
import { CONVERSATION_STATUSES } from './constants';

export const createConversation = doc => {
  return Conversations.insert({
    ...doc,
    status: CONVERSATION_STATUSES.NEW,
    createdAt: new Date(),
    number: Conversations.find().count() + 1,
    messageCount: 0,
  });
};

export const createMessage = doc => {
  return Messages.insert({
    ...doc,
    createdAt: new Date(),
    internal: false,
  });
};
