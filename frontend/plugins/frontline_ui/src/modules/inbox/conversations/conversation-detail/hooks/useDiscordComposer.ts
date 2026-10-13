import { useMutation } from '@apollo/client';
import { useCallback, useEffect, useMemo } from 'react';
import { useThrottledCallback } from 'use-debounce';
import type { EditorMentionItem } from 'ui-modules';
import { useTranslation } from 'react-i18next';

import { CONVERSATION_AGENT_TYPING } from '@/inbox/conversations/conversation-detail/graphql/mutations/conversationAgentTyping';
import {
  useDiscordChannelMemberSearch,
  useDiscordConversationParticipants,
} from '@/integrations/discord/hooks/useDiscordSetup';

export const useDiscordComposer = ({
  conversationId,
  isDiscord,
  isInternalNote,
}: {
  conversationId: string;
  isDiscord: boolean;
  isInternalNote: boolean;
}) => {
  const { t } = useTranslation('frontline');
  const participants = useDiscordConversationParticipants(
    conversationId,
    !isDiscord || !conversationId,
  );
  const { search: searchMembers, status: memberStatus } =
    useDiscordChannelMemberSearch(
      conversationId,
      !isDiscord || !conversationId,
    );

  const mentionItems = useMemo<EditorMentionItem[]>(() => {
    const byUserId = new Map<string, EditorMentionItem>();

    for (const person of participants) {
      if (person.userId && !byUserId.has(person.userId)) {
        byUserId.set(person.userId, {
          id: person.userId,
          fullName: person.name || t('discord-user', 'Discord user'),
          avatar: person.avatar,
        });
      }
    }

    return [...byUserId.values()];
  }, [participants, t]);

  const searchMentionItems = useCallback(
    async (query: string): Promise<EditorMentionItem[]> => {
      const found = await searchMembers(query);

      return found
        .filter((person) => person.userId)
        .map((person) => ({
          id: person.userId,
          fullName: person.name || t('discord-user', 'Discord user'),
          avatar: person.avatar,
        }));
    },
    [searchMembers, t],
  );

  const mentionNote = useMemo(() => {
    switch (memberStatus) {
      case 'TRUNCATED':
        return t(
          'discord-member-search-truncated',
          'Too many matches — keep typing to narrow down',
        );
      case 'FORBIDDEN':
        return t(
          'discord-member-search-forbidden',
          'Bot cannot read this channel — showing people who have chatted',
        );
      case 'ERROR':
        return t(
          'discord-member-search-unavailable',
          'Member search unavailable — showing people who have chatted',
        );
      default:
        return undefined;
    }
  }, [memberStatus, t]);

  const [notifyAgentTyping] = useMutation(CONVERSATION_AGENT_TYPING);
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

  useEffect(() => {
    const shouldStopTyping =
      isDiscord && !isInternalNote && Boolean(conversationId);
    const activeConversationId = conversationId;

    return () => {
      pingAgentTyping.cancel();
      if (shouldStopTyping) {
        notifyAgentTyping({
          variables: {
            conversationId: activeConversationId,
            typing: false,
          },
        }).catch(() => undefined);
      }
    };
  }, [
    conversationId,
    isDiscord,
    isInternalNote,
    notifyAgentTyping,
    pingAgentTyping,
  ]);

  return {
    mentionItems,
    mentionNote,
    pingAgentTyping,
    searchMentionItems,
    stopAgentTyping,
  };
};
