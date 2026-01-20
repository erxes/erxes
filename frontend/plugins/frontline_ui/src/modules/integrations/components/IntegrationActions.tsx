import { useConversationContext } from '@/inbox/conversations/conversation-detail/hooks/useConversationContext';
import { Suspense } from 'react';
import { IntegrationType } from '@/types/Integration';
import { lazy } from 'react';

const FacebookPostTrigger = lazy(() =>
  import('@/integrations/facebook/components/FacebookPostTrigger').then(
    (module) => ({ default: module.FacebookPostTrigger }),
  ),
);

const InstagramPostTrigger = lazy(()=>
  import('@/integrations/instagram/components/InstagramPostTrigger').then(
    (module) => ({default:module.InstagramPostTrigger}),
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
        <InstagramPostTrigger erxesApiId={_id} />
      )}
    </Suspense>
  );
};
