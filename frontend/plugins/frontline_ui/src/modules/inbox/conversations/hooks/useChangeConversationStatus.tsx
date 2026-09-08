import { MutationHookOptions, useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { CONVERSATION_CHANGE_STATUS } from '@/inbox/conversations/graphql/mutations/conversationChangeStatus';
import { useTranslation } from 'react-i18next';

export const useChangeConversationStatus = () => {
  const { t } = useTranslation('frontline');
  const [changeConversationStatus, { loading }] = useMutation(
    CONVERSATION_CHANGE_STATUS,
  );

  const REQUIRED_REFETCH_QUERIES = [
    'ConversationCounts',
    'FrontlineInboxNewConversationCount',
    'FrontlineInboxSidebarWorkCounts',
    'GetMyChannels',
  ];

  const handleChangeConversationStatus = (options: MutationHookOptions) => {
    const callerRefetchQueries = options.refetchQueries;
    const refetchQueries = Array.isArray(callerRefetchQueries)
      ? [...new Set([...callerRefetchQueries, ...REQUIRED_REFETCH_QUERIES])]
      : (callerRefetchQueries ?? REQUIRED_REFETCH_QUERIES);

    changeConversationStatus({
      ...options,
      refetchQueries,
      update: (cache, data, mutationOptions) => {
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
        }
        options.update?.(cache, data, mutationOptions);
      },
      onError: (error) => {
        options.onError?.(error);
        toast({
          title: t('error'),
          description: error.message,
          variant: 'destructive',
        });
      },
    });
  };

  return {
    changeConversationStatus: handleChangeConversationStatus,
    loading,
  };
};
