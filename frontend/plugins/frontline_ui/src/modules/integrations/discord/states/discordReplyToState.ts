import { atom } from 'jotai';

export type DiscordReplyTarget = {
  messageId: string;
  preview: string;
  internal?: boolean;
};

export const discordReplyToState = atom<DiscordReplyTarget | null>(null);
