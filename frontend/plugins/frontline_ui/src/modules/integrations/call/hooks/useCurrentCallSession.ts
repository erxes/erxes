import { useApolloClient, useSubscription } from '@apollo/client';
import { useAtomValue, useSetAtom } from 'jotai';
import { useEffect, useRef, useState } from 'react';

import { CALL_SESSION_UPDATED } from '../graphql/subscriptions/subscriptions';
import { callConfigAtom } from '@/integrations/call/states/sipStates';
import {
  currentCallConversationIdAtom,
  historyIdAtom,
} from '@/integrations/call/states/callStates';
import { refetchCallHistories } from '@/integrations/call/hooks/useCallHistories';
import type { CallSessionUpdatedSubscription } from '~/gql/graphql';

export type CallSession = NonNullable<
  CallSessionUpdatedSubscription['callSessionUpdated']
>;

const ENDED_SESSION_CLEANUP_MS = 1500;

export const useCurrentCallSession = () => {
  const config = useAtomValue(callConfigAtom);
  const client = useApolloClient();
  const setCurrentCallConversationId = useSetAtom(
    currentCallConversationIdAtom,
  );
  const setHistoryId = useSetAtom(historyIdAtom);
  const [session, setSession] = useState<CallSession | null>(null);
  const cleanupTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const extension = config?.operators?.find((op) => op?.gsUsername)?.gsUsername;

  const { data } = useSubscription(CALL_SESSION_UPDATED, {
    variables: {
      inboxIntegrationId: config?.inboxId,
      extension,
    },
    skip: !config?.inboxId,
  });

  useEffect(() => () => clearTimeout(cleanupTimerRef.current), []);

  useEffect(() => {
    const next = data?.callSessionUpdated;
    if (!next) return;

    // A newer update owns the ids; the previous call's cleanup must not run.
    clearTimeout(cleanupTimerRef.current);
    setSession(next);

    if (next.conversationId) {
      setCurrentCallConversationId(next.conversationId);
    }
    if (next._id) {
      setHistoryId(next._id);
    }
    if (next.status === 'ended' || next.status === 'missed') {
      refetchCallHistories(client);
      cleanupTimerRef.current = setTimeout(() => {
        setHistoryId(null);
        setCurrentCallConversationId(null);
      }, ENDED_SESSION_CLEANUP_MS);
    }
  }, [client, data, setCurrentCallConversationId, setHistoryId]);

  return { session };
};
