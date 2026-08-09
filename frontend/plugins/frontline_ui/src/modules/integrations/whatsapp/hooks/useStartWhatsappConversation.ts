import { useMutation } from '@apollo/client';
import { START_WHATSAPP_CONVERSATION } from '../graphql/mutations/startWhatsappConversation';

/**
 * Opens a WhatsApp thread with a contact who has never messaged in.
 *
 * The conversation list is refetched rather than patched: the new thread has to
 * appear under whatever filters, assignment and channel scoping the agent is
 * currently viewing, which a hand-written cache insert cannot get right.
 */
export const useStartWhatsappConversation = () => {
  const [startWhatsappConversation, { loading }] = useMutation<{
    whatsappStartConversation: string;
  }>(START_WHATSAPP_CONVERSATION, {
    refetchQueries: ['Conversations'],
  });

  return {
    startWhatsappConversation,
    loading,
  };
};
