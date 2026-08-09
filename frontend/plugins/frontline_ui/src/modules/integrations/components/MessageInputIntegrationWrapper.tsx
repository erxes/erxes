import { useConversationContext } from '@/inbox/conversations/hooks/useConversationContext';
import { FacebookMessageInputWrapper } from '@/integrations/facebook/components/FacebookMessageInputWrapper';
import { WhatsappMessageInputWrapper } from '@/integrations/whatsapp/components/WhatsappMessageInputWrapper';
import { IntegrationType } from '@/types/Integration';
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

  if (integration?.kind === IntegrationType.WHATSAPP_MESSENGER) {
    return (
      <WhatsappMessageInputWrapper>{children}</WhatsappMessageInputWrapper>
    );
  }

  return children;
};
