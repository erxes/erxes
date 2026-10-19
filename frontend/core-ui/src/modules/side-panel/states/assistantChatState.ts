import { atom } from 'jotai';

export interface IAssistantChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

// The assistant conversation, kept while the app is open.
export const assistantChatMessagesState = atom<IAssistantChatMessage[]>([]);
