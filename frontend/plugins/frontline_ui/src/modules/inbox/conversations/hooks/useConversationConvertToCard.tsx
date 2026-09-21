import { useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { CONVERSATION_CONVERT_TO_CARD } from '@/inbox/conversations/graphql/mutations/conversationConvertToCard';
import { IConversationConvertVariables } from '@/inbox/conversations/types/conversationConvert';

export const useConversationConvertToCard = () => {
  const { t } = useTranslation('frontline');
  const { toast } = useToast();
  const [convertMutation, { loading }] = useMutation<
    { conversationConvertToCard: string },
    IConversationConvertVariables
  >(CONVERSATION_CONVERT_TO_CARD, {
    refetchQueries: ['ConversationConvertedItems', 'getRelationsByEntity'],
    awaitRefetchQueries: true,
  });

  const convertToCard = async (
    variables: IConversationConvertVariables,
  ): Promise<string | undefined> => {
    try {
      const { data } = await convertMutation({ variables });

      toast({
        title: t('success', 'Success!'),
        description: t(
          'conversation-converted-successfully',
          "You've successfully converted a conversation to {{type}}",
          { type: variables.type },
        ),
        variant: 'default',
      });

      return data?.conversationConvertToCard;
    } catch (error) {
      toast({
        title: t('error', 'Error'),
        description: error instanceof Error ? error.message : String(error),
        variant: 'destructive',
      });

      return undefined;
    }
  };

  return { convertToCard, loading };
};
