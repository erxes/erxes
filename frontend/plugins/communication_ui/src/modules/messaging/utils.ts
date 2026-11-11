import type { ApolloError } from '@apollo/client';
import type { AdminConversationItem } from './types';

export const conversationTitle = (
  conversation: Pick<AdminConversationItem, 'kind' | 'title'> & {
    participants?: AdminConversationItem['participants'];
  },
) => {
  if (conversation.kind === 'GROUP')
    return conversation.title || 'Untitled group';
  const names = (conversation.participants ?? []).map(
    (member) => member.displayName,
  );
  return names.length ? names.join(' · ') : 'Direct conversation';
};

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('') || '?';

export const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export type AccessProblem = 'forbidden' | 'audit' | 'notFound' | 'failed';

export const accessProblem = (error: ApolloError): AccessProblem => {
  const codes = error.graphQLErrors.map((item) => item.extensions?.code);
  if (codes.includes('FORBIDDEN') || codes.includes('UNAUTHORIZED'))
    return 'forbidden';
  if (codes.includes('SERVICE_UNAVAILABLE')) return 'audit';
  if (codes.includes('NOT_FOUND')) return 'notFound';
  return 'failed';
};
