import { useSubscription } from '@apollo/client';
import { useAtomValue, useSetAtom } from 'jotai';
import { useEffect, useState } from 'react';

import { CALL_SESSION_UPDATED } from '../graphql/subscriptions/subscriptions';
import { callConfigAtom } from '@/integrations/call/states/sipStates';
import {
  currentCallConversationIdAtom,
  historyIdAtom,
} from '@/integrations/call/states/callStates';

export type CallSession = {
  _id: string;
  uniqueid: string;
  inboxIntegrationId?: string;
  conversationId?: string;
  customerId?: string;
  customerPhone: string;
  operatorPhone?: string;
  callType?: 'incoming' | 'outgoing';
  status: 'ringing' | 'active' | 'ended' | 'missed' | 'failed';
  queueName?: string;
  answeredBy?: string;
  answeredExtension?: string;
  startedAt?: string;
  answeredAt?: string;
  endedAt?: string;
  durationSec?: number;
  hangupCause?: string;
  recordUrl?: string;
  ringingOperators?: Array<{
    userId?: string;
    extensionNumber: string;
    state: 'ringing' | 'answered' | 'rejected' | 'noanswer';
    ringedAt?: string;
    answeredAt?: string;
  }>;
};

export const useCurrentCallSession = () => {
  const config = useAtomValue(callConfigAtom);
  const setCurrentCallConversationId = useSetAtom(
    currentCallConversationIdAtom,
  );
  const setHistoryId = useSetAtom(historyIdAtom);
  const [session, setSession] = useState<CallSession | null>(null);

  const extension = config?.operators?.find(
    (op: any) => op.extensionNumber || op.gsUsername,
  )?.gsUsername;

  const { data } = useSubscription(CALL_SESSION_UPDATED, {
    variables: {
      inboxIntegrationId: config?.inboxId,
      extension,
    },
    skip: !config?.inboxId,
  });

  useEffect(() => {
    const next = data?.callSessionUpdated as CallSession | undefined;
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
