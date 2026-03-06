import { useAtomValue, useSetAtom } from 'jotai';
import { Separator, Skeleton, useQueryState } from 'erxes-ui';

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
import { IConversation } from '@/inbox/types/Conversation';
import { IIntegration } from '@/integrations/types/Integration';
import { MessageInputIntegrationWrapper } from '@/integrations/components/MessageInputIntegrationWrapper';
import { messageExtraInfoState } from '../states/messageExtraInfoState';
import { useEffect } from 'react';
import { ConversationSideWidget } from '@/inbox/conversations/conversation-detail/components/ConversationSideWidget';
import { useLocation } from 'react-router-dom';

export const ConversationDetail = () => {
  const [conversationId] = useQueryState<string>('conversationId');
  const [relatedConversationId] = useQueryState<string>(
    'relatedConversationId',
  );
  const activeConversationCandidate = useAtomValue(activeConversationState);
  const setExtraInfo = useSetAtom(messageExtraInfoState);

  const location = useLocation();
  const isInInbox = location.pathname.includes('my-inbox');

  const currentConversation =
    activeConversationCandidate?._id === conversationId ||
    activeConversationCandidate?._id === relatedConversationId
      ? activeConversationCandidate
      : null;

  const { conversationDetail, loading } = useConversationDetail({
    variables: {
      _id: conversationId || relatedConversationId,
    },
    skip: !conversationId && !relatedConversationId,
    fetchPolicy: isInInbox ? 'network-only' : 'cache-and-network',
  });

  const { integrationId } = currentConversation || conversationDetail || {};

  const { integration } = useIntegrationInline({
    variables: {
      _id: integrationId,
    },
    skip: !integrationId,
  });

  useEffect(() => {
    if (!conversationId) {
      return;
    }
    setExtraInfo(undefined);
  }, [conversationId, setExtraInfo]);

  if (!conversationId) {
    return <NoConversationSelected />;
  }

  if (loading) {
    return (
      <div className="flex flex-col">
        <div className="h-12 border-b flex-none flex items-center px-6">
          <Skeleton className="w-32 h-4" />
          <Skeleton className="w-32 h-4 ml-auto" />
        </div>
        <div className="relative h-full">
          <InboxMessagesSkeleton />
        </div>
      </div>
    );
  }

  const conversationAllDetails = {
    ...currentConversation,
    ...conversationDetail,
    integration,
    loading,
  } as IConversation & {
    integration?: IIntegration;
    loading?: boolean;
  };

  return (
    <div className="flex h-full overflow-hidden">
      <div className="flex flex-col h-full overflow-hidden flex-auto">
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
            {integration?.kind &&
              ['messenger', 'lead'].includes(integration.kind) && (
                <ConversationMessages conversationId={conversationId || ''} />
              )}
            <ConversationIntegrationDetail />
          </ConversationDetailLayout>
          <ConversationMarkAsReadEffect />
        </ConversationProvider>
      </div>
      <ConversationSideWidget
        customerId={conversationAllDetails?.customerId || ''}
        _id={conversationAllDetails?._id || ''}
      />
    </div>
  );
};
