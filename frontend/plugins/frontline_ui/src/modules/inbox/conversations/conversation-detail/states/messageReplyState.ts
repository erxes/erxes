import { atom } from 'jotai';

export type MessageReplyTarget = {
  messageId: string;
  providerMessageId?: string;
  preview: string;
  authorName?: string;
  attachment?: {
    url: string;
    name?: string;
    type?: string;
  };
  nativeReply: boolean;
};

export const messageReplyState = atom<MessageReplyTarget | null>(null);
