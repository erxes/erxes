import { useSubscription } from '@apollo/client';
import { useAtomValue, useSetAtom } from 'jotai';
import { useEffect, useState } from 'react';

import { CALL_SESSION_UPDATED } from '../graphql/subscriptions/subscriptions';
import { callConfigAtom } from '@/integrations/call/states/sipStates';
import {
  currentCallConversationIdAtom,
  historyIdAtom,
} from '@/integrations/call/states/callStates';
import type { CallSessionUpdatedSubscription } from '~/gql/graphql';

export type CallSession = NonNullable<
  CallSessionUpdatedSubscription['callSessionUpdated']
>;

export const useCurrentCallSession = () => {
  const config = useAtomValue(callConfigAtom);
  const setCurrentCallConversationId = useSetAtom(
    currentCallConversationIdAtom,
  );
  const setHistoryId = useSetAtom(historyIdAtom);
  const [session, setSession] = useState<CallSession | null>(null);

  const extension = config?.operators?.find((op) => op?.gsUsername)?.gsUsername;

  const { data } = useSubscription(CALL_SESSION_UPDATED, {
    variables: {
      inboxIntegrationId: config?.inboxId,
      extension,
    },
    skip: !config?.inboxId,
  });

  useEffect(() => {
    const next = data?.callSessionUpdated;
    if (!next) return;

    setSession(next);

    if (next.conversationId) {
      setCurrentCallConversationId(next.conversationId);
    }
    if (next._id) {
      setHistoryId(next._id);
    }
    if (next.status === 'ended' || next.status === 'missed') {
      setTimeout(() => {
        setHistoryId(null);
        setCurrentCallConversationId(null);
      }, 1500);
    }
  }, [data, setCurrentCallConversationId, setHistoryId]);

  return { session };
};
