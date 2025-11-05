import { useAtomValue, useSetAtom } from 'jotai';
import { Button, Resizable, Separator, Skeleton } from 'erxes-ui';

import { ConversationContext } from '@/inbox/conversations/context/ConversationContext';

import { activeConversationState } from '@/inbox/conversations/states/activeConversationState';
import { ConversationIntegrationDetail } from '@/integrations/components/ConversationIntegrationDetail';

import { ConversationMessages } from '@/inbox/conversation-messages/components/ConversationMessages';
import { InboxMessagesSkeleton } from '@/inbox/components/InboxMessagesSkeleton';
import { useIntegrationInline } from '@/integrations/hooks/useIntegrations';
import { IConversation } from '@/inbox/types/Conversation';
import { IIntegration } from '@/integrations/types/Integration';
import { useEffect } from 'react';
import { messageExtraInfoState } from '@/inbox/conversations/conversation-detail/states/messageExtraInfoState';
import { useConversationDetail } from '@/inbox/conversations/conversation-detail/hooks/useConversationDetail';
import { NoConversationSelected } from '@/inbox/conversations/conversation-detail/components/NoConversationSelected';
import { ConversationMarkAsReadEffect } from '@/inbox/conversations/conversation-detail/components/ConversationMarkAsReadEffect';
import { CustomersInline } from 'ui-modules';
import { useNavigate } from 'react-router-dom';
import { IconMail } from '@tabler/icons-react';

export const ConversationDetailView = ({
  conversationId,
}: {
  conversationId: string;
}) => {
  const activeConversationCandidate = useAtomValue(activeConversationState);
  const setExtraInfo = useSetAtom(messageExtraInfoState);

  const navigate = useNavigate();

  const currentConversation =
    activeConversationCandidate?._id === conversationId
      ? activeConversationCandidate
      : null;

  const { conversationDetail, loading } = useConversationDetail({
    variables: {
      _id: conversationId,
    },
    skip: !conversationId,
    fetchPolicy: 'cache-and-network',
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

  return (
    <ConversationContext.Provider
      value={
        {
          ...currentConversation,
          ...conversationDetail,
          integration,
          loading,
        } as IConversation & {
          integration?: IIntegration;
          loading?: boolean;
        }
      }
    >
      <div className="flex h-full overflow-hidden">
        <div className="flex flex-col h-full overflow-hidden flex-auto">
          <div className="h-11 flex items-center px-5 text-xs font-medium flex-none gap-3 whitespace-nowrap justify-between">
            <CustomersInline
              customers={
                conversationDetail?.customer
                  ? [conversationDetail?.customer]
                  : undefined
              }
              customerIds={
                conversationDetail?.customerId
                  ? [conversationDetail?.customerId]
                  : undefined
              }
              className="text-sm text-foreground flex-none"
              placeholder="Conversation with"
            />
            <Button
              variant={'outline'}
              onClick={() =>
                navigate(`/frontline/inbox?conversationId=${conversationId}`)
              }
            >
              Go to conversation
              <IconMail />
            </Button>
          </div>
          <Separator />

          <Resizable.PanelGroup direction="vertical">
            <Resizable.Panel defaultSize={70}>
              {integration?.kind &&
                ['messenger', 'lead'].includes(integration?.kind) && (
                  <ConversationMessages conversationId={conversationId} />
                )}
              <ConversationIntegrationDetail />
            </Resizable.Panel>
          </Resizable.PanelGroup>
          <ConversationMarkAsReadEffect />
        </div>
      </div>
    </ConversationContext.Provider>
  );
};
