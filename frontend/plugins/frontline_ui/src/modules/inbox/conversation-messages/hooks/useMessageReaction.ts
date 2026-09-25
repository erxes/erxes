import { useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

import { CONVERSATION_MESSAGE_REACT } from '@/inbox/conversations/conversation-detail/graphql/mutations/conversationMessageReact';

export const useMessageReaction = () => {
  const { t } = useTranslation('frontline');
  const [react, { loading }] = useMutation(CONVERSATION_MESSAGE_REACT, {
    refetchQueries: [
      'ConversationMessages',
      'InstagramConversationMessages',
      'FacebookConversationMessages',
    ],
  });

  const toggleReaction = async ({
    conversationId,
    messageId,
    reaction,
    remove,
  }: {
    conversationId: string;
    messageId: string;
    reaction: string;
    remove: boolean;
  }) => {
    try {
      await react({
        variables: { conversationId, messageId, reaction, remove },
      });
      toast({
        title: remove ? 'Reaction removed' : 'Reaction added',
        variant: 'default',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      const windowExpired = /outside of (?:the )?allowed window/i.test(message);
      toast({
        title: windowExpired
          ? t('reaction-window-expired', 'Reaction window expired')
          : t('reaction-failed', "Couldn't update reaction"),
        description: windowExpired
          ? t(
              'reaction-window-expired-description',
              'You can react once the customer sends a new message.',
            )
          : t('reaction-failed-description', 'Please try again in a moment.'),
        variant: 'destructive',
      });
    }
  };

  return { toggleReaction, loading };
};
