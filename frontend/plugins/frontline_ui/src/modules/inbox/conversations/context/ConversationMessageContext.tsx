import { IMessage } from '@/inbox/types/Conversation';
import { createContext } from 'react';

type ConversationMessageContextValue = IMessage & {
  previousMessage: IMessage;
  nextMessage: IMessage;
  // True when the conversation has messages from more than one customer (e.g. a
  // Discord group channel), so each message renders its own author.
  isGroupConversation?: boolean;
};

export const ConversationMessageContext =
  createContext<ConversationMessageContextValue>(
    {} as ConversationMessageContextValue,
  );
