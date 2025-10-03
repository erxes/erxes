import { createContext } from 'react';
import { IConversation } from '@/inbox/types/Conversation';
import { IIntegration } from '@/integrations/types/Integration';

export const ConversationContext = createContext<
  | (IConversation & {
      loading?: boolean;
      integration?: IIntegration;
    })
  | null
>(null);
