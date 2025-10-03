import { IMessage } from '@/inbox/types/Conversation';
import { createContext } from 'react';

export const ConversationMessageContext = createContext<
  IMessage & { previousMessage: IMessage; nextMessage: IMessage }
>({} as IMessage & { previousMessage: IMessage; nextMessage: IMessage });
