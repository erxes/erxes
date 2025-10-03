import { IConversation } from '@/inbox/types/Conversation';
import { atom } from 'jotai';

export const activeConversationState = atom<Partial<IConversation> | null>(
  null,
);
