import { createContext, useState, useEffect, ReactNode } from 'react';
import {
  IConversation,
  IConversationIntegration,
} from '@/inbox/types/Conversation';

interface IConversationContext extends IConversation {
  loading?: boolean;
  integration?: IConversationIntegration;
  tagIds: string[];
  setTagIds?: (ids: string[]) => void;
}

export const ConversationContext = createContext<IConversationContext | null>(
  null,
);

interface IConversationProviderProps {
  conversation: IConversation & {
    integration?: IConversationIntegration;
    loading?: boolean;
  };
  children: ReactNode;
}

export const ConversationProvider = ({
  conversation,
  children,
}: IConversationProviderProps) => {
  const [tagIds, setTagIds] = useState<string[]>(conversation.tagIds || []);

  useEffect(() => {
    setTagIds(conversation.tagIds || []);
  }, [conversation.tagIds]);

  const contextValue = {
    ...conversation,
    tagIds,
    setTagIds,
  };

  return (
    <ConversationContext.Provider value={contextValue}>
      {children}
    </ConversationContext.Provider>
  );
};
