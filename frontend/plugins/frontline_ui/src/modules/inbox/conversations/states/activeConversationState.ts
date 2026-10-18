import type { IConversationContextValue } from '@/inbox/types/Conversation';
import { atom } from 'jotai';

export const activeConversationState =
  atom<Partial<IConversationContextValue> | null>(null);
