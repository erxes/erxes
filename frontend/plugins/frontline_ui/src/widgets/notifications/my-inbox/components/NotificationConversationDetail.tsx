import { ConversationDetail } from '@/inbox/conversations/conversation-detail/components/ConversationDetail';
import { useQueryState } from 'erxes-ui';
import { useEffect } from 'react';

export const NotificationConversationDetail = ({ contentTypeId }: any) => {
  const [conversationId, setConversationId] =
    useQueryState<string>('conversationId');

  useEffect(() => {
    if (conversationId !== contentTypeId) {
      setConversationId(contentTypeId);
    }
  }, [contentTypeId, conversationId, setConversationId]);

  return <ConversationDetail />;
};
