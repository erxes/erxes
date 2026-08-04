import { useConversationContext } from '@/inbox/conversations/conversation-detail/hooks/useConversationContext';
import { Suspense, lazy } from 'react';
import { IntegrationType } from '@/types/Integration';

const FacebookPostTrigger = lazy(() =>
  import('@/integrations/facebook/components/FacebookPostTrigger').then(
    (module) => ({ default: module.FacebookPostTrigger }),
  ),
);

const IgPostTrigger = lazy(() =>
  import('@/integrations/instagram/components/IgPostTrigger').then(
    (module) => ({ default: module.IgPostTrigger }),
  ),
);

export const IntegrationActions = () => {
  const { integration, _id } = useConversationContext();

  return (
    <Suspense fallback={<div />}>
      {integration?.kind === IntegrationType.FACEBOOK_POST && (
        <FacebookPostTrigger erxesApiId={_id} />
      )}
      {integration?.kind === IntegrationType.INSTAGRAM_POST && (
        <IgPostTrigger erxesApiId={_id} />
      )}
    </Suspense>
  );
};
