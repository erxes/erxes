import { MutationHookOptions, useMutation } from '@apollo/client';
import { MARK_AS_READ_CONVERSATION } from '../graphql/mutations/markAsReadConversation';
import { useAtomValue } from 'jotai';
import { currentUserState } from 'ui-modules';
import { useConversationContext } from '../hooks/useConversationContext';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

type MarkConversationAsReadResponse = {
  conversationMarkAsRead: {
    _id: string;
    __typename: 'Conversation';
  };
};

export const useConversationMarkAsRead = () => {
  const { t } = useTranslation('frontline');
  const [markAsRead] = useMutation<
    MarkConversationAsReadResponse,
    { id: string }
  >(MARK_AS_READ_CONVERSATION);
  const currentUser = useAtomValue(currentUserState);
  const { readUserIds, _id, integration } = useConversationContext();

  const handleMarkAsRead = (
    options?: MutationHookOptions<
      MarkConversationAsReadResponse,
      { id: string }
    >,
  ) => {
    if (readUserIds?.includes(currentUser?._id || '')) {
      return;
    }

    markAsRead({
      ...options,
      variables: {
        id: _id,
      },
      optimisticResponse: {
        conversationMarkAsRead: {
          _id,
          __typename: 'Conversation',
        },
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
        const channelId = integration?.channelId || integration?.channel?._id;

        cache.modify({
          id: cache.identify({
            __typename: 'Conversation',
            _id,
          }),
          fields: {
            readUserIds: () => [...(readUserIds || []), currentUser?._id],
          },
        });

        if (channelId) {
          cache.modify({
            id: cache.identify({
              __typename: 'Channel',
              _id: channelId,
            }),
            fields: {
              unreadConversationCount: (count = 0) => Math.max(0, count - 1),
            },
          });
        }
      },
    });
  };

  return {
    markAsRead: handleMarkAsRead,
  };
};
