import { lazy, Suspense } from 'react';
import { IntegrationType } from '@/types/Integration';
import { useConversationContext } from '@/inbox/conversations/conversation-detail/hooks/useConversationContext';

const IMapConversationDetail = lazy(() =>
  import('@/integrations/imap/components/ImapConversationDetail').then(
    (module) => ({ default: module.ImapConversationDetail }),
  ),
);

const FbPostConversationDetail = lazy(() =>
  import('@/integrations/facebook/components/FbPostConversationDetail').then(
    (module) => ({ default: module.FbPostConversationDetail }),
  ),
);
const CallConversationDetail = lazy(() =>
  import('@/integrations/call/components/CallConversationDetail').then(
    (module) => ({ default: module.CallConversationDetail }),
  ),
);

const FbMessengerConversationDetail = lazy(() =>
  import(
    '@/integrations/facebook/components/FacebookConversationMessages'
  ).then((module) => ({ default: module.FacebookConversationMessages })),
);

export const ConversationIntegrationDetail = () => {
  const { integration } = useConversationContext();

  return (
    <Suspense fallback={<div />}>
      {integration?.kind === IntegrationType.IMAP && <IMapConversationDetail />}
      {integration?.kind === IntegrationType.CALL && <CallConversationDetail />}
      {integration?.kind === IntegrationType.FACEBOOK_POST && (
        <FbPostConversationDetail />
      )}
      {integration?.kind === IntegrationType.FACEBOOK_MESSENGER && (
        <FbMessengerConversationDetail />
      )}
    </Suspense>
  );
};
