import { ConversationDetail } from '@/inbox/conversations/conversation-detail/components/ConversationDetail';
import { IconExternalLink } from '@tabler/icons-react';
import { Button, useQueryState } from 'erxes-ui';
import { useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router';

export const NotificationConversationDetail = ({ contentTypeId }: any) => {
  const [conversationId, setConversationId] =
    useQueryState<string>('conversationId');

  useEffect(() => {
    if (conversationId !== contentTypeId) {
      setConversationId(contentTypeId);
    }
  }, [contentTypeId, conversationId, setConversationId]);

  return (
    <div className="flex flex-col h-full">
      <NotificationActionsSlot />
      <ConversationDetail />
    </div>
  );
};

const NotificationActionsSlot = () => {
  const [conversationId] = useQueryState<string>('conversationId');
  const portalTarget =
    typeof window !== 'undefined'
      ? document.getElementById('notifications-actions-slot')
      : null;

  const memoizedPortal = useMemo(() => {
    if (!conversationId || !portalTarget) return null;

    return createPortal(
      <Button variant="outline" asChild>
        <Link to={`/frontline/inbox?conversationId=${conversationId}`}>
          Go to Conversation
          <IconExternalLink />
        </Link>
      </Button>,
      portalTarget,
    );
  }, [conversationId, portalTarget]);

  return memoizedPortal;
};
