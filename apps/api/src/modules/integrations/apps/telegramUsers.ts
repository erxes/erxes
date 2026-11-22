import { z } from 'zod';
import { Text } from '@erxes/plugin-sdk/integrations';

export const User = z.object({
  id: Text,
  is_bot: z.boolean().optional(),
  is_premium: z.boolean().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  username: z.string().optional(),
  language_code: z.string().optional(),
});

export const Chat = z.object({
  id: Text,
  type: z.string(),
  title: z.string().optional(),
  username: z.string().optional(),
});

export const Member = z.object({
  status: z.string(),
  user: User,
  is_member: z.boolean().optional(),
  custom_title: z.string().optional(),
  until_date: z.number().optional(),
});

const IN_CHAT = new Set(['creator', 'administrator', 'member']);

export const at = (seconds: number | undefined) =>
  seconds ? new Date(seconds * 1000).toISOString() : undefined;

export const nameOf = (user: z.output<typeof User> | undefined) =>
  [user?.first_name, user?.last_name].filter(Boolean).join(' ') || undefined;

export const fromOf = (user: z.output<typeof User> | undefined) => ({
  fromId: user?.id,
  fromUsername: user?.username,
  firstName: user?.first_name,
  lastName: user?.last_name,
  languageCode: user?.language_code,
  fromIsBot: user?.is_bot,
  fromIsPremium: user?.is_premium,
});

export const chatOf = (chat: z.output<typeof Chat> | undefined) => ({
  chatId: chat?.id,
  chatType: chat?.type,
  chatTitle: chat?.title,
  chatUsername: chat?.username,
});

export const inChat = (member: z.output<typeof Member>) =>
  IN_CHAT.has(member.status) || (member.status === 'restricted' && member.is_member === true);
