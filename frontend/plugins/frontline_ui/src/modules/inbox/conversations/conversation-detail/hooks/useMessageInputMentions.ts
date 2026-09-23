import type { MessageInputMentionsResult } from '@/inbox/conversations/conversation-detail/types/messageInput';
import { useCallback, useMemo } from 'react';

import type { EditorMentionItem } from 'ui-modules';

import {
  useDiscordChannelMemberSearch,
  useDiscordConversationParticipants,
} from '@/integrations/discord/hooks/useDiscordSetup';

export const useMessageInputMentions = (
  conversationId: string,
  isDiscord: boolean,
): MessageInputMentionsResult => {
  const discordParticipants = useDiscordConversationParticipants(
    conversationId,
    !isDiscord || !conversationId,
  );
  const { search: searchDiscordMembers, status: discordMemberStatus } =
    useDiscordChannelMemberSearch(
      conversationId,
      !isDiscord || !conversationId,
    );
  const discordMentionItems = useMemo<EditorMentionItem[]>(() => {
    const byUserId = new Map<string, EditorMentionItem>();
    for (const person of discordParticipants) {
      if (person.userId && !byUserId.has(person.userId)) {
        byUserId.set(person.userId, {
          id: person.userId,
          fullName: person.name || 'Discord user',
          avatar: person.avatar,
        });
      }
    }
    return [...byUserId.values()];
  }, [discordParticipants]);
  const searchDiscordMentionItems = useCallback(
    async (query: string): Promise<EditorMentionItem[]> => {
      const found = await searchDiscordMembers(query);

      return found
        .filter((person) => person.userId)
        .map((person) => ({
          id: person.userId,
          fullName: person.name || 'Discord user',
          avatar: person.avatar,
        }));
    },
    [searchDiscordMembers],
  );
  const discordMentionNote = useMemo(() => {
    switch (discordMemberStatus) {
      case 'TRUNCATED':
        return 'Too many matches — keep typing to narrow down';
      case 'FORBIDDEN':
        return 'Bot cannot read this channel — showing people who have chatted';
      case 'ERROR':
        return 'Member search unavailable — showing people who have chatted';
      default:
        return undefined;
    }
  }, [discordMemberStatus]);

  return { discordMentionItems, searchDiscordMentionItems, discordMentionNote };
};
