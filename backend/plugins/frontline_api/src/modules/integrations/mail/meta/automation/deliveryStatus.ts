import type { IMailMessage } from '@/integrations/mail/@types/message';
import { MAIL_DELIVERY_STATUSES } from '@/integrations/mail/constants';

export const assertMailAutomationDeliverySucceeded = (
  message: Pick<
    IMailMessage,
    'deliveryStatus' | 'deliveryError' | 'bouncedRecipients'
  >,
) => {
  if (message.deliveryStatus === MAIL_DELIVERY_STATUSES.FAILED) {
    throw new Error(message.deliveryError || 'Email delivery failed');
  }

  if (message.deliveryStatus === MAIL_DELIVERY_STATUSES.BOUNCED) {
    throw new Error(
      `Email bounced for: ${(message.bouncedRecipients ?? []).join(', ')}`,
    );
  }
};
