import { MutationFunctionOptions, useMutation } from '@apollo/client';
import { CONVERSATION_ASSIGN } from '@/inbox/conversations/graphql/mutations/conversationAssign';
import type {
  ConversationsAssignMutation,
  ConversationsAssignMutationVariables,
} from '~/gql/graphql';

type AssignConversationsOptions = Omit<
  MutationFunctionOptions<
    ConversationsAssignMutation,
    ConversationsAssignMutationVariables
  >,
  'variables'
> & {
  variables?: { conversationIds: string[]; assignedUserId?: string | null };
};

export const useAssignConversations = () => {
  const [assignConversations, { loading }] = useMutation(CONVERSATION_ASSIGN);

  const handleAssignConversations = (options: AssignConversationsOptions) => {
    assignConversations({
      ...options,
      update: (cache) => {
        try {
          options.variables?.conversationIds.forEach((id) => {
            cache.modify({
              id: cache.identify({ __typename: 'Conversation', _id: id }),
              fields: {
                assignedUserId: () => options.variables?.assignedUserId,
              },
            });
          });
        } catch (error) {
          console.error(error);
          return;
        }
      },
    });
  };

  return {
    assignConversations: handleAssignConversations,
    loading,
  };
};
