import { MutationHookOptions, useMutation } from '@apollo/client';
import { MARK_AS_READ_CONVERSATION } from '../graphql/mutations/markAsReadConversation';
import { useAtomValue } from 'jotai';
import { currentUserState } from 'ui-modules';
import { useConversationContext } from '../hooks/useConversationContext';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const useConversationMarkAsRead = () => {
  const { t } = useTranslation('frontline');
  const [markAsRead] = useMutation(MARK_AS_READ_CONVERSATION);
  const currentUser = useAtomValue(currentUserState);
  const { readUserIds, _id } = useConversationContext();

  const handleMarkAsRead = (
    options?: MutationHookOptions<{ _id: string }, { id: string }>,
  ) => {
    if (readUserIds?.includes(currentUser?._id || '')) {
      return;
    }

    markAsRead({
      ...options,
      variables: {
        id: _id,
      },
      // The sidebar badges count conversations this user has not read, so they
      // have to fall as soon as one is read.
      refetchQueries: [
        'ConversationCounts',
        'FrontlineInboxSidebarWorkCounts',
        'GetMyChannels',
      ],
      onError: (error) => {
        toast({
          title: t('error'),
          description: error.message,
          variant: 'destructive',
        });
      },
      update: (cache) => {
        cache.modify({
          id: cache.identify({
            __typename: 'Conversation',
            _id,
          }),
          fields: {
            readUserIds: () => [...(readUserIds || []), currentUser?._id],
          },
        });
      },
    });
  };

  return {
    markAsRead: handleMarkAsRead,
  };
};
