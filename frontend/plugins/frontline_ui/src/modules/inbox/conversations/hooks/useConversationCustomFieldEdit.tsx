import { MutationFunctionOptions, useMutation } from '@apollo/client';
import { CONVERSATION_EDIT_CUSTOM_FIELDS } from '../graphql/mutations/conversationEditCustomFields';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import type {
  ConversationEditCustomFieldsMutation,
  ConversationEditCustomFieldsMutationVariables,
} from '~/gql/graphql';

type IConversationEditCustomFieldsVariables = {
  _id: string;
  propertiesData?: Record<string, unknown>;
};

export const useConversationCustomFieldEdit = () => {
  const { t } = useTranslation('frontline');
  const [editCustomFields, { loading }] = useMutation(
    CONVERSATION_EDIT_CUSTOM_FIELDS,
  );

  const mutate = (
    variables: IConversationEditCustomFieldsVariables,
    options?: MutationFunctionOptions<
      ConversationEditCustomFieldsMutation,
      ConversationEditCustomFieldsMutationVariables
    >,
  ) => {
    editCustomFields({
      variables,
      optimisticResponse: {
        conversationEditCustomFields: {
          __typename: 'Conversation',
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
