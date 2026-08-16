import { atom } from 'jotai';

export type DiscordReplyTarget = {
  messageId: string;
  preview: string;
};

export const discordReplyToState = atom<DiscordReplyTarget | null>(null);
