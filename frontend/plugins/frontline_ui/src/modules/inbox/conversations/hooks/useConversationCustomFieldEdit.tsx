import { MutationHookOptions, useMutation } from '@apollo/client';
import { CONVERSATION_EDIT_CUSTOM_FIELDS } from '../graphql/mutations/conversationEditCustomFields';
import { IConversation } from '@/inbox/types/Conversation';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

type IConversationEditCustomFieldsVariables = { _id: string } & Record<
  string,
  unknown
>;

interface IConversationEditCustomFieldsResponse {
  conversationEditCustomFields: IConversation;
}

export const useConversationCustomFieldEdit = () => {
  const { t } = useTranslation('frontline');
  const [editCustomFields, { loading }] = useMutation<
    IConversationEditCustomFieldsResponse,
    IConversationEditCustomFieldsVariables
  >(CONVERSATION_EDIT_CUSTOM_FIELDS);

  const mutate = (
    variables: IConversationEditCustomFieldsVariables,
    options?: MutationHookOptions<
      IConversationEditCustomFieldsResponse,
      IConversationEditCustomFieldsVariables
    >,
  ) => {
    editCustomFields({
      variables,
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

  return { mutate, loading };
};
