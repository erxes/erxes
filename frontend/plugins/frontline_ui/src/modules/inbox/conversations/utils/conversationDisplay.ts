import { compactList } from '@/shared/utils/cursorList';
import { toMemberUser } from '@/channels/utils/channelMembers';
import type { IUser } from 'ui-modules';
import type { IConversationContextValue } from '@/inbox/types/Conversation';

const compactCount = new Intl.NumberFormat('en', {
  notation: 'compact',
  maximumFractionDigits: 1,
});
export const formatConversationCount = (count: number): string =>
  count < 10_000 ? count.toLocaleString('en') : compactCount.format(count);
export const conversationAssigneeIds = (
  conversation: Pick<
    IConversationContextValue,
    'assignedUserId' | 'assignedUserIds'
  >,
): string[] =>
  compactList(
    conversation.assignedUserIds ??
      (conversation.assignedUserId ? [conversation.assignedUserId] : []),
  );

type IntegrationAppearance = {
  label: string;
  avatarClass: string;
};
const appearances: Record<string, IntegrationAppearance> = {
  'facebook-messenger': {
    label: 'Messenger',
    avatarClass:
      'bg-blue-100 text-blue-700 dark:bg-blue-500/25 dark:text-blue-300',
  },
  'facebook-post': {
    label: 'Facebook',
    avatarClass:
      'bg-blue-100 text-blue-700 dark:bg-blue-500/25 dark:text-blue-300',
  },
  'instagram-messenger': {
    label: 'Instagram',
    avatarClass:
      'bg-pink-100 text-pink-700 dark:bg-pink-500/25 dark:text-pink-300',
  },
  'instagram-post': {
    label: 'Instagram post',
    avatarClass:
      'bg-pink-100 text-pink-700 dark:bg-pink-500/25 dark:text-pink-300',
  },
  'telegram-messenger': {
    label: 'Telegram',
    avatarClass: 'bg-sky-100 text-sky-700 dark:bg-sky-500/25 dark:text-sky-300',
  },
  'discord-messenger': {
    label: 'Discord',
    avatarClass:
      'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/25 dark:text-indigo-300',
  },
  mail: {
    label: 'Email',
    avatarClass:
      'bg-teal-100 text-teal-700 dark:bg-teal-500/25 dark:text-teal-300',
  },
  messenger: {
    label: 'Web chat',
    avatarClass:
      'bg-violet-100 text-violet-700 dark:bg-violet-500/25 dark:text-violet-300',
  },
  lead: {
    label: 'Form',
    avatarClass:
      'bg-amber-100 text-amber-800 dark:bg-amber-500/25 dark:text-amber-300',
  },
  calls: {
    label: 'Call',
    avatarClass:
      'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/25 dark:text-emerald-300',
  },
  callpro: {
    label: 'Call Pro',
    avatarClass:
      'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/25 dark:text-emerald-300',
  },
};
export const integrationAppearance = (kind?: string): IntegrationAppearance =>
  appearances[kind ?? ''] ?? {
    label: kind || 'Integration',
    avatarClass: 'bg-muted text-muted-foreground',
  };

export const conversationAssignees = (
  conversation: Pick<
    IConversationContextValue,
    'assignedUsers' | 'assignedUser'
  >,
): IUser[] =>
  (
    conversation.assignedUsers ??
    (conversation.assignedUser ? [conversation.assignedUser] : [])
  )
    .map(toMemberUser)
    .filter((member): member is IUser => member !== undefined);
