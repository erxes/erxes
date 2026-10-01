import { useQuery, useSubscription } from '@apollo/client';
import { useState } from 'react';
import {
  MAIL_CONVERSATION_DETAIL_QUERY,
  MAIL_CONVERSATION_INTERNAL_NOTES_QUERY,
  MAIL_MESSAGE_INSERTED_SUBSCRIPTION,
} from '@/integrations/mail/graphql/queries/mailQueries';
import type { MailMessage } from '@/integrations/mail/types/mailThread';
import { toast } from 'erxes-ui';
import type { IMessage } from '@/inbox/types/Conversation';

const PAGE_SIZE = 20;
const NOTES_PAGE_SIZE = 20;

interface MailConversationDetailResponse {
  mailConversationDetail: {
    messages: MailMessage[];
    hasMore: boolean;
  } | null;
}

interface MailConversationNotesResponse {
  mailConversationInternalNotes: IMessage[];
  mailConversationInternalNotesCount: number;
}

export const useMailThreadData = (conversationId?: string) => {
  const [limit, setLimit] = useState(PAGE_SIZE);
  const { data, previousData, loading, error, refetch } =
    useQuery<MailConversationDetailResponse>(MAIL_CONVERSATION_DETAIL_QUERY, {
      variables: {
        conversationId,
        limit,
      },
      skip: !conversationId,
      fetchPolicy: 'cache-and-network',
      notifyOnNetworkStatusChange: true,
    });
  const {
    data: notesData,
    previousData: previousNotesData,
    fetchMore: fetchMoreNotes,
  } = useQuery<MailConversationNotesResponse>(
    MAIL_CONVERSATION_INTERNAL_NOTES_QUERY,
    {
      variables: { conversationId, notesSkip: 0, notesLimit: NOTES_PAGE_SIZE },
      skip: !conversationId,
      fetchPolicy: 'cache-and-network',
    },
  );

  useSubscription(MAIL_MESSAGE_INSERTED_SUBSCRIPTION, {
    variables: { _id: conversationId },
    skip: !conversationId,
    onData: () => {
      refetch().catch((err: Error) => {
        toast({ title: err.message, variant: 'destructive' });
      });
      fetchMoreNotes({
        variables: { notesSkip: 0 },
        updateQuery: (previous, { fetchMoreResult }) => {
          if (!fetchMoreResult) return previous;
          const newIds = new Set(
            fetchMoreResult.mailConversationInternalNotes.map(({ _id }) => _id),
          );
          return {
            ...fetchMoreResult,
            mailConversationInternalNotes: [
              ...fetchMoreResult.mailConversationInternalNotes,
              ...previous.mailConversationInternalNotes.filter(
                ({ _id }) => !newIds.has(_id),
              ),
            ],
          };
        },
      }).catch((err: Error) => {
        toast({ title: err.message, variant: 'destructive' });
      });
    },
  });

  const detail =
    data?.mailConversationDetail ?? previousData?.mailConversationDetail;
  const messages = detail?.messages ?? [];
  const internalNotes =
    notesData?.mailConversationInternalNotes ??
    previousNotesData?.mailConversationInternalNotes ??
    [];
  const notesCount =
    notesData?.mailConversationInternalNotesCount ??
    previousNotesData?.mailConversationInternalNotesCount ??
    0;

  return {
    messages,
    internalNotes,
    notesCount,
    loadMoreNotes: () =>
      fetchMoreNotes({
        variables: { notesSkip: internalNotes.length },
        updateQuery: (previous, { fetchMoreResult }) => {
          if (!fetchMoreResult) return previous;
          const loadedIds = new Set(
            previous.mailConversationInternalNotes.map(({ _id }) => _id),
          );
          return {
            ...fetchMoreResult,
            mailConversationInternalNotes: [
              ...previous.mailConversationInternalNotes,
              ...fetchMoreResult.mailConversationInternalNotes.filter(
                ({ _id }) => !loadedIds.has(_id),
              ),
            ],
          };
        },
      }),
    hasMore: detail?.hasMore,
    loading,
    error,
    loadMore: () => setLimit((value) => value + PAGE_SIZE),
  };
};
