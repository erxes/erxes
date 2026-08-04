import { MutationHookOptions, useMutation } from '@apollo/client';
import { CONVERSATION_SET_AUTOMATED_REPLY_CONTROL } from '../graphql/mutations/conversationAutomatedReplyControl';
import { IConversation } from '@/inbox/types/Conversation';
import { toast } from 'erxes-ui';

interface IConversationAutomatedReplyControlVariables {
  _id: string;
  status: 'active' | 'human_active';
  reason: 'manual';
}

interface IConversationAutomatedReplyControlResponse {
  conversationSetAutomatedReplyControl: IConversation;
}

export const useConversationAutomatedReplyControl = () => {
  const [setAutomatedReplyControl, { loading }] = useMutation<
    IConversationAutomatedReplyControlResponse,
    IConversationAutomatedReplyControlVariables
  >(CONVERSATION_SET_AUTOMATED_REPLY_CONTROL);

  const handleSetAutomatedReplyControl = (
    options: MutationHookOptions<
      IConversationAutomatedReplyControlResponse,
      IConversationAutomatedReplyControlVariables
    >,
  ) => {
    setAutomatedReplyControl({
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      },
      ...options,
    });
  };

  return {
    setAutomatedReplyControl: handleSetAutomatedReplyControl,
    loading,
  };
};
