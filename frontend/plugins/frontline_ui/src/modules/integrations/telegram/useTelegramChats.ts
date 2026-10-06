import { useApolloClient, useSubscription } from '@apollo/client';
import { useEffect, useState } from 'react';
import { useAtomValue } from 'jotai';
import { currentUserState } from 'ui-modules';
import { TELEGRAM_CHAT_MESSAGE_INSERTED } from './graphql';
import { TELEGRAM_CHATS, type TelegramChat } from './graphql';

export const telegramChatLabel = (chat?: TelegramChat): string | undefined => {
  if (!chat || (chat.chatType === 'private' && !chat.messageThreadId))
    return undefined;
  const name = chat.chatTitle || `Telegram ${chat.chatId}`;
  return chat.messageThreadId
    ? `${name} · ${chat.topicName || `#${chat.messageThreadId}`}`
    : name;
};

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
    const load = async (): Promise<void> => {
      setLoading(Boolean(ids.length));
      const next = new Map<string, TelegramChat>();
      try {
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
      } catch {
        // Metadata is supplementary; keep the existing inbox/customer fallback
        // when permissions or connectivity prevent fetching a chat label.
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [client, idsKey, revision]);
  return { chats, loading };
};
