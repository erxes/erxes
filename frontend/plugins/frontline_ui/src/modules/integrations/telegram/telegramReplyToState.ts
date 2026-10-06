import { atom } from 'jotai';

export const telegramReplyToState = atom<{
  conversationId: string;
  messageId: string;
  preview: string;
} | null>(null);
