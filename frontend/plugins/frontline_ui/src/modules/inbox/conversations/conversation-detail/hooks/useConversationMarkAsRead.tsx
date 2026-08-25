import { MutationHookOptions, useMutation } from '@apollo/client';
import { MARK_AS_READ_CONVERSATION } from '../graphql/mutations/markAsReadConversation';
import { useAtomValue } from 'jotai';
import { currentUserState } from 'ui-modules';
import { useConversationContext } from '../hooks/useConversationContext';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { INBOX_UNREAD_CONVERSATION_COUNT } from '@/inbox/conversations/graphql/queries/getConversationCounts';

type MarkConversationAsReadResponse = {
  conversationMarkAsRead: {
    _id: string;
    __typename: 'Conversation';
  };
};

type InboxUnreadCountResponse = {
  conversationsTotalCount?: number;
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
    const currentUserId = currentUser?._id;

    if (!_id || !currentUserId || readUserIds?.includes(currentUserId)) {
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
        'FrontlineInboxUnreadConversationCount',
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
            readUserIds: () => [...(readUserIds || []), currentUserId],
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

        const unreadCount = cache.readQuery<InboxUnreadCountResponse>({
          query: INBOX_UNREAD_CONVERSATION_COUNT,
        });

        if (typeof unreadCount?.conversationsTotalCount === 'number') {
          cache.writeQuery<InboxUnreadCountResponse>({
            query: INBOX_UNREAD_CONVERSATION_COUNT,
            data: {
              conversationsTotalCount: Math.max(
                0,
                unreadCount.conversationsTotalCount - 1,
              ),
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
