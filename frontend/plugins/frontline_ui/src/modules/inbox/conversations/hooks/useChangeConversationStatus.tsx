import { useMutation } from '@apollo/client';
import { CONVERSATION_CHANGE_STATUS } from '../graphql/mutations/conversationChangeStatus';
import { MutationHookOptions } from '@apollo/client';
import { toast } from 'erxes-ui';

export const useChangeConversationStatus = () => {
  const [changeConversationStatus, { loading }] = useMutation(
    CONVERSATION_CHANGE_STATUS,
  );

  const handleChangeConversationStatus = (options: MutationHookOptions) => {
    changeConversationStatus({
      update: (cache) => {
        try {
          options.variables?.ids.forEach((id: string) => {
            cache.modify({
              id: cache.identify({ __typename: 'Conversation', _id: id }),
              fields: {
                status: () => options.variables?.status,
              },
            });
          });
        } catch (error) {
          console.error(error);
          return;
        }
      },
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
    changeConversationStatus: handleChangeConversationStatus,
    loading,
  };
};
