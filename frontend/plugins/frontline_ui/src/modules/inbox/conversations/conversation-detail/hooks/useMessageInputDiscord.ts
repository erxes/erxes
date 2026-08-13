import { useMutation } from '@apollo/client';
import { useCallback, useMemo } from 'react';
import { useThrottledCallback } from 'use-debounce';
import { type EditorMentionItem } from 'ui-modules';
import {
  useDiscordChannelMemberSearch,
  useDiscordConversationParticipants,
} from '@/integrations/discord/hooks/useDiscordSetup';
import { CONVERSATION_AGENT_TYPING } from '@/inbox/conversations/conversation-detail/graphql/mutations/conversationAgentTyping';

interface UseMessageInputDiscordOptions {
  conversationId: string;
  isDiscord: boolean;
  isInternalNote: boolean;
}

export const useMessageInputDiscord = ({
  conversationId,
  isDiscord,
  isInternalNote,
}: UseMessageInputDiscordOptions) => {
  const skipDiscordQueries = !isDiscord || !conversationId;
  const participants = useDiscordConversationParticipants(
    conversationId,
    skipDiscordQueries,
  );
  const { search: searchMembers, status: memberStatus } =
    useDiscordChannelMemberSearch(conversationId, skipDiscordQueries);
  const [notifyAgentTyping] = useMutation(CONVERSATION_AGENT_TYPING);

  const mentionItems = useMemo<EditorMentionItem[]>(() => {
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

  const searchMentionItems = useCallback(
    async (query: string): Promise<EditorMentionItem[]> => {
      const found = await searchMembers(query);

      return found
        .filter((person) => person.userId)
        .map((person) => ({
          id: person.userId,
          fullName: person.name || 'Discord user',
          avatar: person.avatar,
        }));
    },
    [searchMembers],
  );

  const mentionStatusNote = useMemo(() => {
    switch (memberStatus) {
      case 'TRUNCATED':
        return 'Too many matches — keep typing to narrow down';
      case 'FORBIDDEN':
        return 'Bot cannot read this channel — showing people who have chatted';
      case 'ERROR':
        return 'Member search unavailable — showing people who have chatted';
      default:
        return undefined;
    }
  }, [memberStatus]);

  const pingAgentTyping = useThrottledCallback(
    () => {
      if (isDiscord && !isInternalNote && conversationId) {
        notifyAgentTyping({
          variables: { conversationId, typing: true },
        }).catch(() => undefined);
      }
    },
    10000,
    { leading: true, trailing: false },
  );

  const stopAgentTyping = useCallback(() => {
    pingAgentTyping.cancel();
    if (isDiscord && conversationId) {
      notifyAgentTyping({
        variables: { conversationId, typing: false },
      }).catch(() => undefined);
    }
  }, [conversationId, isDiscord, notifyAgentTyping, pingAgentTyping]);

  return {
    mentionItems,
    mentionStatusNote,
    pingAgentTyping,
    searchMentionItems,
    stopAgentTyping,
  };
};
