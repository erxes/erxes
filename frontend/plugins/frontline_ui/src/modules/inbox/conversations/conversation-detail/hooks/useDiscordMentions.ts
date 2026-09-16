import { useCallback, useMemo } from 'react';
import type { EditorMentionItem } from 'ui-modules';

import {
  useDiscordChannelMemberSearch,
  useDiscordConversationParticipants,
} from '@/integrations/discord/hooks/useDiscordSetup';

export const useDiscordMentions = (
  conversationId: string,
  isDiscord: boolean,
) => {
  const participants = useDiscordConversationParticipants(
    conversationId,
    !isDiscord || !conversationId,
  );
  const { search, status } = useDiscordChannelMemberSearch(
    conversationId,
    !isDiscord || !conversationId,
  );
  const discordMentionItems = useMemo<EditorMentionItem[]>(() => {
    const byUserId = new Map<string, EditorMentionItem>();
    for (const person of participants) {
      if (person.userId && !byUserId.has(person.userId)) {
        byUserId.set(person.userId, {
          id: person.userId,
          fullName: person.name || 'Discord user',
          avatar: person.avatar,
        });
      }
    }
    return [...byUserId.values()];
  }, [participants]);
  const searchDiscordMentionItems = useCallback(
    async (query: string): Promise<EditorMentionItem[]> => {
      const found = await search(query);
      return found
        .filter((person) => person.userId)
        .map((person) => ({
          id: person.userId,
          fullName: person.name || 'Discord user',
          avatar: person.avatar,
        }));
    },
    [search],
  );
  const discordMentionNote = useMemo(() => {
    switch (status) {
      case 'TRUNCATED':
        return 'Too many matches — keep typing to narrow down';
      case 'FORBIDDEN':
        return 'Bot cannot read this channel — showing people who have chatted';
      case 'ERROR':
        return 'Member search unavailable — showing people who have chatted';
      default:
        return undefined;
    }
  }, [status]);

  return {
    discordMentionItems,
    discordMentionNote,
    searchDiscordMentionItems,
  };
};
