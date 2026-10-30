import { useAtomValue, useSetAtom } from 'jotai';
import { Separator, useQueryState } from 'erxes-ui';

import { ConversationProvider } from '@/inbox/conversations/context/ConversationContext';
import { ConversationHeader } from './ConversationHeader';
import { useConversationDetail } from '../hooks/useConversationDetail';

import { activeConversationState } from '@/inbox/conversations/states/activeConversationState';
import { ConversationDetailLayout } from './ConversationDetailLayout';
import { ConversationIntegrationDetail } from '@/integrations/components/ConversationIntegrationDetail';
import { MessageInput } from './MessageInput';

import { ConversationMessages } from '@/inbox/conversation-messages/components/ConversationMessages';
import { InboxMessagesSkeleton } from '@/inbox/components/InboxMessagesSkeleton';
import { useIntegrationInline } from '@/integrations/hooks/useIntegrations';
import { NoConversationSelected } from './NoConversationSelected';
import { ConversationMarkAsReadEffect } from './ConversationMarkAsReadEffect';
import { toConversationContextValue } from '@/inbox/conversations/utils/conversationContext';
import { isRecord } from '@/shared/utils/isRecord';
import { MessageInputIntegrationWrapper } from '@/integrations/components/MessageInputIntegrationWrapper';
import { messageExtraInfoState } from '../states/messageExtraInfoState';
import { messageReplyState } from '../states/messageReplyState';
import { useEffect } from 'react';
import { ConversationSideWidget } from '@/inbox/conversations/conversation-detail/components/ConversationSideWidget';
import { useCompactWidth } from '@/inbox/hooks/useCompactWidth';
import { useLocation } from 'react-router-dom';

// Narrower than this, the widget overlays instead of taking a 320px column.
const SIDE_WIDGET_OVERLAY_WIDTH = 700;

export const ConversationDetail = () => {
  const { ref: detailRef, isCompact } = useCompactWidth<HTMLDivElement>(
    SIDE_WIDGET_OVERLAY_WIDTH,
  );
  const [conversationId] = useQueryState<string>('conversationId');
  const [relatedConversationId] = useQueryState<string>(
    'relatedConversationId',
  );
  const activeConversationCandidate = useAtomValue(activeConversationState);
  const setExtraInfo = useSetAtom(messageExtraInfoState);
  const setReplyTo = useSetAtom(messageReplyState);

  const location = useLocation();
  const isInInbox = location.pathname.includes('my-inbox');

  const currentConversation =
    activeConversationCandidate?._id === conversationId ||
    activeConversationCandidate?._id === relatedConversationId
      ? activeConversationCandidate
      : null;

  const detailId = conversationId || relatedConversationId;
  const { conversationDetail, loading } = useConversationDetail({
    variables: detailId ? { _id: detailId } : undefined,
    skip: !detailId,
    fetchPolicy: isInInbox ? 'network-only' : 'cache-and-network',
  });

  const { integrationId } = currentConversation || conversationDetail || {};

  const { integration } = useIntegrationInline({
    variables: integrationId ? { _id: integrationId } : undefined,
    skip: !integrationId,
  });

  useEffect(() => {
    if (!conversationId) {
      return;
    }
    setExtraInfo(() => undefined);
    setReplyTo(null);
  }, [conversationId, setExtraInfo, setReplyTo]);

  if (!conversationId) {
    return <NoConversationSelected />;
  }

  const conversationAllDetails = toConversationContextValue({
    _id: conversationDetail?._id ?? currentConversation?._id ?? conversationId,
    conversation: currentConversation,
    detail: conversationDetail,
    integration,
    loading,
  });
  const { propertiesData } = conversationAllDetails;

  return (
    <div ref={detailRef} className="relative flex h-full overflow-hidden">
      <div className="flex flex-col h-full overflow-hidden flex-auto min-w-0">
        <ConversationProvider conversation={conversationAllDetails}>
          <ConversationHeader />
          <Separator />
          <ConversationDetailLayout
            input={
              <MessageInputIntegrationWrapper>
                <MessageInput conversationId={conversationId || ''} />
              </MessageInputIntegrationWrapper>
            }
          >
            {loading && conversationDetail?._id !== conversationId ? (
              <InboxMessagesSkeleton />
            ) : (
              <>
                {integration?.kind &&
                  [
                    'messenger',
                    'lead',
                    'discord-messenger',
                    'telegram-messenger',
                  ].includes(integration.kind) && (
                    <ConversationMessages
                      conversationId={conversationId || ''}
                    />
                  )}
                <ConversationIntegrationDetail />
              </>
            )}
          </ConversationDetailLayout>
          <ConversationMarkAsReadEffect />
        </ConversationProvider>
      </div>
      <ConversationSideWidget
        customerId={conversationAllDetails.customerId || ''}
        _id={conversationAllDetails._id}
        propertiesData={isRecord(propertiesData) ? propertiesData : undefined}
        asSheet={isCompact}
        boundaryRef={detailRef}
      />
    </div>
  );
};
