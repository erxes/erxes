import { useConversationContext } from '@/inbox/conversations/hooks/useConversationContext';
import { FacebookMessageInputWrapper } from '@/integrations/facebook/components/FacebookMessageInputWrapper';
import { IntegrationType } from '@/types/Integration';
import { InstagramMessageInputWrapper } from '../instagram/components/InstagramMessageInputWrapper';

export const MessageInputIntegrationWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { integration } = useConversationContext();

  if (integration?.kind === IntegrationType.FACEBOOK_MESSENGER) {
    return (
      <FacebookMessageInputWrapper>{children}</FacebookMessageInputWrapper>
    );
  }

  if (integration?.kind === IntegrationType.INSTAGRAM_MESSENGER) {
    return (
      <InstagramMessageInputWrapper>{children}</InstagramMessageInputWrapper>
    );
  }

  return children;
};
