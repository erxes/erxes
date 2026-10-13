import { MutationHookOptions, useMutation } from '@apollo/client';
import { CONVERSATION_EDIT_CUSTOM_FIELDS } from '../graphql/mutations/conversationEditCustomFields';
import { IConversation } from '@/inbox/types/Conversation';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

type IConversationEditCustomFieldsVariables = {
  _id: string;
  propertiesData?: Record<string, unknown>;
} & Record<string, unknown>;

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
      optimisticResponse: {
        conversationEditCustomFields: {
          __typename: 'Conversation' as const,
          _id: variables._id,
          propertiesData: variables.propertiesData ?? {},
        },
      },
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
