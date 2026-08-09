import { IconBrandWhatsapp } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useConversationContext } from '@/inbox/conversations/conversation-detail/hooks/useConversationContext';
import { WhatsappNewConversation } from './WhatsappNewConversation';

/**
 * One-click "message this customer on WhatsApp" from the open conversation
 * header. An agent handling any thread often needs to reach the same
 * customer on another channel, so the action is offered everywhere rather
 * than only on WhatsApp threads.
 *
 * Not gated on the open conversation's OWN channel being WhatsApp — quite
 * the opposite, this is only useful because it is not: an agent already on
 * a WhatsApp thread has the composer for that.
 *
 * Reuses WhatsappNewConversation rather than a third copy of the
 * start-conversation mutation logic (WhatsappContactButton already does
 * the same for the customer detail page).
 */
export const WhatsappConversationButton = () => {
  const { t } = useTranslation('frontline');
  const { customerId } = useConversationContext();

  if (!customerId) return null;

  return (
    <WhatsappNewConversation
      customerId={customerId}
      trigger={
        <Button
          variant="ghost"
          size="icon"
          className="[&>svg]:size-4 flex-none"
          aria-label={t('whatsapp-message-contact')}
          title={t('whatsapp-message-contact')}
        >
          <IconBrandWhatsapp />
        </Button>
      }
    />
  );
};
