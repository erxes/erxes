import { useAtomValue, useSetAtom } from 'jotai';
import { Button, Separator, useQueryState } from 'erxes-ui';
import { IconExclamationCircle, IconRefresh } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

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
import { MESSAGE_THREAD_INTEGRATION_KINDS } from '@/inbox/conversations/conversation-detail/constants/messageThreadIntegrationKinds';
import { useLocation } from 'react-router-dom';

/**
 * Apollo flips `loading` to false on failure just as it does on success, so
 * without this the detail pane falls through to the "loaded" branch with an
 * undefined conversation — an empty header, no messages (the integration kind
 * never resolves) and no hint that anything went wrong. Matches the dashed-tile
 * empty-state pattern used by NoConversationSelected / NoMessages, plus the
 * outline+IconRefresh retry button already established in the WhatsApp
 * template pickers.
 */
const ConversationLoadFailed = ({ onRetry }: { onRetry: () => void }) => {
  const { t } = useTranslation('frontline');
  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <div className="flex size-28 items-center justify-center rounded-2xl border border-dashed bg-sidebar">
        <IconExclamationCircle size={64} className="text-scroll" stroke={1} />
      </div>
      <div className="mt-5 font-medium text-muted-foreground">
        {t('conversation-load-failed')}
      </div>
      <Button variant="outline" className="mt-4" onClick={onRetry}>
        <IconRefresh />
        {t('retry')}
      </Button>
    </div>
  );
};

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

  const { conversationDetail, loading, error, refetch } = useConversationDetail({
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
              /* Nothing loaded means nothing to reply to — an enabled composer
                 over a failed thread would send into the void. */
              error || integration?.kind === 'imap' ? null : (
                <MessageInputIntegrationWrapper>
                  <MessageInput conversationId={conversationId || ''} />
                </MessageInputIntegrationWrapper>
              )
            }
          >
            {loading ? (
              <InboxMessagesSkeleton />
            ) : error ? (
              <ConversationLoadFailed onRetry={() => refetch()} />
            ) : (
              <>
                {integration?.kind &&
                  MESSAGE_THREAD_INTEGRATION_KINDS.includes(
                    integration.kind,
                  ) && (
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
        customerId={conversationAllDetails?.customerId || ''}
        _id={conversationAllDetails?._id || ''}
      />
    </div>
  );
};
