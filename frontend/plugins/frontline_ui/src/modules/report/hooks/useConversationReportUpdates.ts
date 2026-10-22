import { useApolloClient, useSubscription } from '@apollo/client';
import { useEffect, useRef } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { CONVERSATION_REPORT_CHANGED } from '@/report/graphql/subscriptions/conversationReportChanged';
import {
  GET_CONVERSATION_OPEN,
  GET_CONVERSATION_CLOSE,
  GET_CONVERSATION_RESOLVED,
  GET_CONVERSATION_TAG,
  GET_CONVERSATION_SOURCE,
  GET_CONVERSATION_RESPONSES,
  GET_CONVERSATION_LIST,
  GET_OPEN_CONVERSATIONS_BY_DATE,
  GET_RESOLVED_CONVERSATIONS_BY_DATE,
} from '@/report/graphql/queries/getChart';

/** Refresh active overview queries together after conversation data changes. */
export const useConversationReportUpdates = (): void => {
  const client = useApolloClient();
  const refreshing = useRef(false);
  const pending = useRef(false);
  const mounted = useRef(true);
  const refreshReports = useDebouncedCallback(
    async (): Promise<void> => {
      if (refreshing.current || !mounted.current) return;
      refreshing.current = true;
      pending.current = false;
      try {
        await client.refetchQueries({
          include: [
            GET_CONVERSATION_OPEN,
            GET_CONVERSATION_CLOSE,
            GET_CONVERSATION_RESOLVED,
            GET_CONVERSATION_TAG,
            GET_CONVERSATION_SOURCE,
            GET_CONVERSATION_RESPONSES,
            GET_CONVERSATION_LIST,
            GET_OPEN_CONVERSATIONS_BY_DATE,
            GET_RESOLVED_CONVERSATIONS_BY_DATE,
          ],
        });
      } catch {
        // Each observed report query exposes its own loading/error state.
      } finally {
        refreshing.current = false;
        if (pending.current && mounted.current) void refreshReports();
      }
    },
    500,
    { maxWait: 1000 },
  );

  useEffect(() => {
    mounted.current = true;
    pending.current = true;
    void refreshReports();
    return () => {
      mounted.current = false;
      refreshReports.cancel();
    };
  }, [refreshReports]);

  useSubscription(CONVERSATION_REPORT_CHANGED, {
    onData: () => {
      pending.current = true;
      void refreshReports();
    },
  });
};
