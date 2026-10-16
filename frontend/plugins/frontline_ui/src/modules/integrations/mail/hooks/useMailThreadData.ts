import { useQuery, useSubscription } from '@apollo/client';
import { useCallback, useMemo, useState } from 'react';
import {
  MAIL_CONVERSATION_DETAIL_QUERY,
  MAIL_CONVERSATION_INTERNAL_NOTES_QUERY,
  MAIL_MESSAGE_INSERTED_SUBSCRIPTION,
} from '@/integrations/mail/graphql/queries/mailQueries';
import { toast } from 'erxes-ui';
import { mergeMailInternalNotes } from '@/integrations/mail/utils/mailInternalNotes';
import { toMessage } from '@/inbox/conversation-messages/utils/toMessage';
import { compactList } from '@/shared/utils/cursorList';

const PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 500;
const NOTES_PAGE_SIZE = 20;

export const useMailThreadData = (conversationId?: string) => {
  const [limit, setLimit] = useState(PAGE_SIZE);
  const { data, previousData, loading, error, refetch } = useQuery(
    MAIL_CONVERSATION_DETAIL_QUERY,
    {
      variables: conversationId ? { conversationId, limit } : undefined,
      skip: !conversationId,
      fetchPolicy: 'cache-and-network',
      notifyOnNetworkStatusChange: true,
    },
  );
  const {
    data: notesData,
    previousData: previousNotesData,
    fetchMore: fetchMoreNotes,
    loading: notesLoading,
    error: notesError,
    refetch: refetchNotes,
  } = useQuery(MAIL_CONVERSATION_INTERNAL_NOTES_QUERY, {
    variables: conversationId
      ? { conversationId, notesSkip: 0, notesLimit: NOTES_PAGE_SIZE }
      : undefined,
    skip: !conversationId,
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
  });

  useSubscription(MAIL_MESSAGE_INSERTED_SUBSCRIPTION, {
    variables: conversationId ? { _id: conversationId } : undefined,
    skip: !conversationId,
    onData: ({ data: subscriptionData }) => {
      const message = subscriptionData.data?.conversationMessageInserted;
      if (!message) return;

      if (!message.internal) {
        refetch().catch((err: Error) => {
          toast({ title: err.message, variant: 'destructive' });
        });
        return;
      }

      fetchMoreNotes({
        variables: { notesSkip: 0 },
        updateQuery: (previous, { fetchMoreResult }) => {
          if (!fetchMoreResult) return previous;
          return {
            ...fetchMoreResult,
            mailConversationInternalNotes: mergeMailInternalNotes(
              previous.mailConversationInternalNotes,
              fetchMoreResult.mailConversationInternalNotes,
            ),
          };
        },
      }).catch((err: Error) => {
        toast({ title: err.message, variant: 'destructive' });
      });
    },
  });

  const detail =
    data?.mailConversationDetail ?? previousData?.mailConversationDetail;
  const messages = compactList(detail?.messages);
  const rawInternalNotes =
    notesData?.mailConversationInternalNotes ??
    previousNotesData?.mailConversationInternalNotes;
  const internalNotes = useMemo(
    () => (rawInternalNotes ?? []).map(toMessage),
    [rawInternalNotes],
  );
  const notesCount =
    notesData?.mailConversationInternalNotesCount ??
    previousNotesData?.mailConversationInternalNotesCount ??
    0;
  const loadMore = useCallback(() => {
    setLimit((value) => Math.min(value + PAGE_SIZE, MAX_PAGE_SIZE));
  }, []);

  return {
    messages,
    internalNotes,
    notesCount,
    notesLoading,
    notesError,
    refetchNotes,
    loadMoreNotes: () =>
      fetchMoreNotes({
        variables: { notesSkip: internalNotes.length },
        updateQuery: (previous, { fetchMoreResult }) => {
          if (!fetchMoreResult) return previous;
          return {
            ...fetchMoreResult,
            mailConversationInternalNotes: mergeMailInternalNotes(
              previous.mailConversationInternalNotes,
              fetchMoreResult.mailConversationInternalNotes,
            ),
          };
        },
      }),
    hasMore: Boolean(detail?.hasMore && limit < MAX_PAGE_SIZE),
    loading,
    error,
    loadMore,
  };
};
