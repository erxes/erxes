import { createContext, useState, useEffect, ReactNode } from 'react';
import { IConversation } from '@/inbox/types/Conversation';
import { IIntegration } from '@/integrations/types/Integration';

interface IConversationContext extends IConversation {
  loading?: boolean;
  integration?: IIntegration;
  tagIds: string[];
  setTagIds?: (ids: string[]) => void;
}

export const ConversationContext = createContext<IConversationContext | null>(
  null,
);

interface IConversationProviderProps {
  conversation: IConversation & {
    integration?: IIntegration;
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
