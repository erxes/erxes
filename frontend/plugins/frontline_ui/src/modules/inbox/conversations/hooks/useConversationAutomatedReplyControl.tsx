import { MutationFunctionOptions, useMutation } from '@apollo/client';
import { CONVERSATION_SET_AUTOMATED_REPLY_CONTROL } from '../graphql/mutations/conversationAutomatedReplyControl';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import type {
  ConversationSetAutomatedReplyControlMutation,
  ConversationSetAutomatedReplyControlMutationVariables,
} from '~/gql/graphql';

export const useConversationAutomatedReplyControl = () => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.inbox' });
  const [setAutomatedReplyControl, { loading }] = useMutation(
    CONVERSATION_SET_AUTOMATED_REPLY_CONTROL,
  );

  const handleSetAutomatedReplyControl = (
    options: MutationFunctionOptions<
      ConversationSetAutomatedReplyControlMutation,
      ConversationSetAutomatedReplyControlMutationVariables
    >,
  ) => {
    setAutomatedReplyControl({
      onError: (error) => {
        toast({
          title: t('error', 'Error'),
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
