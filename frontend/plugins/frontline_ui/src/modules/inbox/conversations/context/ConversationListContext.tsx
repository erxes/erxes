import { createContext } from 'react';
import { IConversation } from '@/inbox/types/Conversation';

export interface IConversationListContext {
  conversations: IConversation[];
  loading: boolean;
  totalCount: number;
}

export const ConversationListContext = createContext<IConversationListContext>(
  {} as IConversationListContext,
);
