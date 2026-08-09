import { IconBrandWhatsapp } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { WhatsappNewConversation } from './WhatsappNewConversation';

/**
 * "Message on WhatsApp" from the customer record, on the relation widget.
 *
 * Reuses WhatsappNewConversation entirely rather than a second start-
 * conversation flow: that dialog already validates the template, resolves
 * placeholders and calls whatsappStartConversation, so building a parallel
 * path here would only be a second place for the same 24-hour-window rules
 * to drift out of sync. `customerId` pre-fills and hides its own contact
 * picker; this component supplies only the trigger.
 *
 * This deliberately does not pre-validate the customer's number:
 * WhatsappNewConversation's own SelectCustomer step (skipped here in favour
 * of the id already known) is where an unreachable contact would normally
 * be caught, and the send itself is what Meta ultimately accepts or rejects
 * — there is no local "is this number on WhatsApp" check to run first.
 */
export const WhatsappContactButton = ({
  customerId,
}: {
  customerId?: string;
}) => {
  const { t } = useTranslation('frontline');

  if (!customerId) return null;

  return (
    <WhatsappNewConversation
      customerId={customerId}
      trigger={
        <Button variant="secondary" size="sm" aria-label={t('whatsapp-message-contact')}>
          <IconBrandWhatsapp className="size-3.5" />
          {t('whatsapp-message-contact')}
        </Button>
      }
    />
  );
};
