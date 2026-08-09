import { IconExclamationCircle } from '@tabler/icons-react';
import { differenceInHours } from 'date-fns';
import { Alert } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useConversationContext } from '@/inbox/conversations/hooks/useConversationContext';
import { useConversationMessages } from '@/inbox/conversation-messages/hooks/useConversationMessages';
import { IMessage } from '@/inbox/types/Conversation';
import { WHATSAPP_MESSAGE_WINDOW_HOURS } from '../constants/whatsappSchema';
import { WhatsappTemplatePicker } from './WhatsappTemplatePicker';

/**
 * WhatsApp only accepts free-form replies within 24 hours of the customer's
 * last inbound message. Outside that window Meta rejects everything but a
 * pre-approved template, so the composer is replaced with the template picker —
 * the one send that is still allowed.
 */
export const WhatsappMessageInputWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { t } = useTranslation('frontline');
  const { _id: conversationId } = useConversationContext();

  const { messages, loading } = useConversationMessages({
    variables: {
      conversationId,
      limit: 10,
      skip: 0,
    },
    fetchPolicy: 'cache-first',
    skip: !conversationId,
  });

  if (loading) {
    return (
      <div className="flex-auto h-full px-6">
        <div className="rounded-lg bg-sidebar h-full mx-auto max-w-2xl" />
      </div>
    );
  }

  // Only inbound customer messages reopen the window; our own replies and
  // internal notes do not.
  const lastCustomerMessage = [...(messages || [])]
    .reverse()
    .find((message: IMessage) => !!message.customerId && !message.internal);

  // No inbound message among the page we loaded. That happens on a thread the
  // customer has not written to recently — which is precisely the closed-window
  // case — so the composer stays blocked rather than letting an agent write a
  // reply that Meta will reject. The backend rejects it either way; this only
  // decides which of the two states we show.
  const isOutsideWindow =
    !lastCustomerMessage ||
    differenceInHours(new Date(), new Date(lastCustomerMessage.createdAt)) >=
      WHATSAPP_MESSAGE_WINDOW_HOURS;

  if (!isOutsideWindow) {
    return children;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 flex flex-col gap-4 overflow-auto">
      <Alert>
        <IconExclamationCircle />
        <Alert.Title>{t('whatsapp-24h-window-title')}</Alert.Title>
        <Alert.Description>
          {t('whatsapp-24h-window-description')}
        </Alert.Description>
      </Alert>
      <WhatsappTemplatePicker />
    </div>
  );
};
