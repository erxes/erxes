import { useApolloClient, useSubscription } from '@apollo/client';
import { useEffect, useState } from 'react';
import { useAtomValue } from 'jotai';
import { currentUserState } from 'ui-modules';
import { TELEGRAM_CHAT_MESSAGE_INSERTED } from './graphql';
import { TELEGRAM_CHATS, type TelegramChat } from './graphql';

/** Labels shared chats and forum topics while preserving private-contact display names. */
export const telegramChatLabel = (chat?: TelegramChat): string | undefined => {
  if (!chat || (chat.chatType === 'private' && !chat.messageThreadId))
    return undefined;
  const name = chat.chatTitle || `Telegram ${chat.chatId}`;
  return chat.messageThreadId
    ? `${name} · ${chat.topicName || `#${chat.messageThreadId}`}`
    : name;
};

/** Loads visible chat labels in bounded batches and refreshes them on inbox events. */
export const useTelegramChats = (
  conversationIds: string[],
): {
  chats: Map<string, TelegramChat>;
  loading: boolean;
} => {
  const client = useApolloClient();
  const user = useAtomValue(currentUserState);
  const [revision, setRevision] = useState(0);
  useSubscription<{
    conversationClientMessageInserted: { conversationId: string };
  }>(TELEGRAM_CHAT_MESSAGE_INSERTED, {
    variables: { userId: user?._id },
    skip: !user?._id || !conversationIds.length,
    onData: ({ data }) => {
      const id = data.data?.conversationClientMessageInserted.conversationId;
      if (id && conversationIds.includes(id)) setRevision((value) => value + 1);
    },
  });
  const idsKey = JSON.stringify([...new Set(conversationIds)]);
  const [chats, setChats] = useState(new Map<string, TelegramChat>());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const ids: string[] = JSON.parse(idsKey);
    /** Fetches each metadata batch and ignores results after the effect is cancelled. */
    const load = async (): Promise<void> => {
      setLoading(Boolean(ids.length));
      const next = new Map<string, TelegramChat>();
      // The server caps metadata queries at 100 conversations. Infinite scroll
      // can exceed that; cache-first batches retain labels for the whole list.
      for (let offset = 0; offset < ids.length; offset += 100) {
        const { data } = await client.query<{
          telegramConversationChats: TelegramChat[];
        }>({
          query: TELEGRAM_CHATS,
          fetchPolicy: revision ? 'network-only' : 'cache-first',
          variables: { conversationIds: ids.slice(offset, offset + 100) },
        });
        if (cancelled) return;
        data.telegramConversationChats.forEach((chat) =>
          next.set(chat.conversationId, chat),
        );
      }
      if (!cancelled) setChats(next);
    };
    const finishLoading = (): void => {
      if (!cancelled) setLoading(false);
    };
    // Metadata is supplementary: settle failures while keeping the existing
    // labels or inbox/customer fallback, and ignore cancelled loads.
    load().then(finishLoading, finishLoading);
    return () => {
      cancelled = true;
    };
  }, [client, idsKey, revision]);
  return { chats, loading };
};
