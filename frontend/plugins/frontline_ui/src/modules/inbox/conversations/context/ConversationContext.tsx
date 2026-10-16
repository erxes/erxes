import { createContext, useState, useEffect, ReactNode } from 'react';
import { compactList } from '@/shared/utils/cursorList';
import type { IConversationContextValue } from '@/inbox/types/Conversation';

interface IConversationContext extends IConversationContextValue {
  tagIds: string[];
  setTagIds?: (ids: string[]) => void;
}

export const ConversationContext = createContext<IConversationContext | null>(
  null,
);

interface IConversationProviderProps {
  conversation: IConversationContextValue & {
    tagIds?: (string | null)[] | null;
  };
  children: ReactNode;
}

export const ConversationProvider = ({
  conversation,
  children,
}: IConversationProviderProps) => {
  const [tagIds, setTagIds] = useState<string[]>(
    compactList(conversation.tagIds),
  );

  useEffect(() => {
    setTagIds(compactList(conversation.tagIds));
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
