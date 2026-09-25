import { useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';

import { CONVERSATION_MESSAGE_REACT } from '@/inbox/conversations/conversation-detail/graphql/mutations/conversationMessageReact';

export const useMessageReaction = () => {
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
      toast({
        title: `Failed to react: ${(error as Error).message}`,
        variant: 'destructive',
      });
    }
  };

  return { toggleReaction, loading };
};
