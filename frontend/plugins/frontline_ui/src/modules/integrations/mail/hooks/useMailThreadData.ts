import { useQuery, useSubscription } from '@apollo/client';
import { useState } from 'react';
import {
  MAIL_CONVERSATION_DETAIL_QUERY,
  MAIL_MESSAGE_INSERTED_SUBSCRIPTION,
} from '@/integrations/mail/graphql/queries/mailQueries';
import type { MailMessage } from '@/integrations/mail/types/mailThread';
import type { IMessage } from '@/inbox/types/Conversation';

const PAGE_SIZE = 20;
const NOTES_PAGE_SIZE = 20;

interface MailConversationDetailResponse {
  mailConversationDetail: {
    messages: MailMessage[];
    hasMore: boolean;
  } | null;
  mailConversationInternalNotes: IMessage[];
  mailConversationInternalNotesCount: number;
}

export const useMailThreadData = (conversationId?: string) => {
  const [limit, setLimit] = useState(PAGE_SIZE);
  const { data, previousData, loading, error, refetch, fetchMore } =
    useQuery<MailConversationDetailResponse>(MAIL_CONVERSATION_DETAIL_QUERY, {
      variables: {
        conversationId,
        limit,
        notesSkip: 0,
        notesLimit: NOTES_PAGE_SIZE,
      },
      skip: !conversationId,
      fetchPolicy: 'cache-and-network',
      notifyOnNetworkStatusChange: true,
    });

  useSubscription(MAIL_MESSAGE_INSERTED_SUBSCRIPTION, {
    variables: { _id: conversationId },
    skip: !conversationId,
    onData: () => refetch(),
  });

  const detail =
    data?.mailConversationDetail ?? previousData?.mailConversationDetail;
  const messages = detail?.messages ?? [];
  const internalNotes = data?.mailConversationInternalNotes ?? [];
  const notesCount = data?.mailConversationInternalNotesCount ?? 0;

  return {
    messages,
    internalNotes,
    notesCount,
    loadMoreNotes: () =>
      fetchMore({
        variables: { notesSkip: internalNotes.length },
        updateQuery: (previous, { fetchMoreResult }) =>
          fetchMoreResult
            ? {
                ...fetchMoreResult,
                mailConversationInternalNotes: [
                  ...fetchMoreResult.mailConversationInternalNotes,
                  ...previous.mailConversationInternalNotes,
                ],
              }
            : previous,
      }),
    hasMore: detail?.hasMore,
    loading,
    error,
    loadMore: () => setLimit((value) => value + PAGE_SIZE),
  };
};
