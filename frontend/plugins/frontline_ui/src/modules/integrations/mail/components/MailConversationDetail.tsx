import { useQuery, useSubscription } from '@apollo/client';
import { ScrollArea } from 'erxes-ui';
import { useEffect, useState } from 'react';
import { useSetAtom } from 'jotai';

import {
  MAIL_CONVERSATION_DETAIL_QUERY,
  MAIL_MESSAGE_INSERTED_SUBSCRIPTION,
} from '../graphql/queries/mailQueries';
import { useConversationContext } from '@/inbox/conversations/conversation-detail/hooks/useConversationContext';
import { hideMessageInputState } from '@/inbox/conversations/conversation-detail/states/isInternalState';
import { useMailSendMail } from '../hooks/useMailConversationDetail';
import { MailComposePayload, MailMessage, MailThread } from './MailThread';

const PAGE_SIZE = 20;

interface MailConversationDetailResponse {
  mailConversationDetail: {
    messages: MailMessage[];
    hasMore: boolean;
  } | null;
}

export const MailConversationDetail = () => {
  const { _id: conversationId, integration } = useConversationContext();
  const setHideInput = useSetAtom(hideMessageInputState);
  const [limit, setLimit] = useState(PAGE_SIZE);
  const { mailSendMail, loading: sending } = useMailSendMail();

  useEffect(() => {
    setHideInput(true);
    return () => setHideInput(false);
  }, [setHideInput]);

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

  const onSend = (payload: MailComposePayload, onSent: () => void) =>
    mailSendMail(
      {
        ...payload,
        integrationId: integration?._id ?? '',
        conversationId: conversationId ?? '',
      },
      onSent,
    );

  return (
    <ScrollArea className="h-full">
      <div className="p-4 pb-8">
        <MailThread
          messages={detail?.messages ?? []}
          hasMore={detail?.hasMore}
          loading={loading}
          sending={sending}
          error={error?.message}
          onLoadMore={() => setLimit((value) => value + PAGE_SIZE)}
          onSend={onSend}
        />
      </div>
    </ScrollArea>
  );
};
