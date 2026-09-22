import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSubscription } from '@apollo/client';
import { CONVERSATION_CLIENT_TYPING_STATUS_CHANGED } from '@/inbox/conversations/graphql/subscriptions/inboxSubscriptions';

const TYPING_TTL = 12000;

const PRUNE_INTERVAL = 1000;

type TTypingEvent = {
  conversationId: string;
  customerId?: string;
  customerName?: string;
};

type TTypist = { name: string; expiresAt: number };

export const useConversationTypingStatus = (conversationId?: string) => {
  const [typists, setTypists] = useState<Record<string, TTypist>>({});

  useSubscription<{
    conversationClientTypingStatusChanged: TTypingEvent;
  }>(CONVERSATION_CLIENT_TYPING_STATUS_CHANGED, {
    variables: { _id: conversationId },
    skip: !conversationId,
    onData: ({ data }) => {
      const event = data.data?.conversationClientTypingStatusChanged;

      if (!event) {
        return;
      }

      const name = event.customerName || 'Someone';

      setTypists((prev) => ({
        ...prev,
        [event.customerId || name]: {
          name,
          expiresAt: Date.now() + TYPING_TTL,
        },
      }));
    },
  });

  useEffect(() => {
    setTypists({});
  }, [conversationId]);

  useEffect(() => {
    if (!Object.keys(typists).length) {
      return;
    }

    const timer = setInterval(() => {
      setTypists((prev) => {
        const now = Date.now();
        const next = Object.fromEntries(
          Object.entries(prev).filter(([, typist]) => typist.expiresAt > now),
        );
        return Object.keys(next).length === Object.keys(prev).length
          ? prev
          : next;
      });
    }, PRUNE_INTERVAL);

    return () => clearInterval(timer);
  }, [typists]);

  const clearTypist = useCallback((customerId?: string) => {
    if (!customerId) {
      return;
    }

    setTypists((prev) =>
      prev[customerId]
        ? Object.fromEntries(
            Object.entries(prev).filter(([key]) => key !== customerId),
          )
        : prev,
    );
  }, []);

  const typingNames = useMemo(
    () => Object.values(typists).map((typist) => typist.name),
    [typists],
  );

  return { typingNames, clearTypist };
};
