import { useQuery, useSubscription } from '@apollo/client';
import { useState } from 'react';
import {
  MAIL_CONVERSATION_DETAIL_QUERY,
  MAIL_MESSAGE_INSERTED_SUBSCRIPTION,
} from '@/integrations/mail/graphql/queries/mailQueries';
import type { MailMessage } from '@/integrations/mail/types/mailThread';
import type { IMessage } from '@/inbox/types/Conversation';

const PAGE_SIZE = 20;

interface MailConversationDetailResponse {
  mailConversationDetail: {
    messages: MailMessage[];
    hasMore: boolean;
  } | null;
  conversationMessages: IMessage[];
}

export const useMailThreadData = (conversationId?: string) => {
  const [limit, setLimit] = useState(PAGE_SIZE);
  const { data, previousData, loading, error, refetch } =
    useQuery<MailConversationDetailResponse>(MAIL_CONVERSATION_DETAIL_QUERY, {
      variables: { conversationId, limit },
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
  const internalNotes = (
    data?.conversationMessages ??
    previousData?.conversationMessages ??
    []
  ).filter((message) => message.internal);

  return {
    messages,
    internalNotes,
    hasMore: detail?.hasMore,
    loading,
    error,
    loadMore: () => setLimit((value) => value + PAGE_SIZE),
  };
};
