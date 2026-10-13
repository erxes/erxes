import {
  MutationHookOptions,
  useApolloClient,
  useMutation,
} from '@apollo/client';
import { MARK_AS_READ_CONVERSATION } from '@/inbox/conversations/conversation-detail/graphql/mutations/markAsReadConversation';
import { useAtomValue } from 'jotai';
import { currentUserState } from 'ui-modules';
import { useConversationContext } from '@/inbox/conversations/conversation-detail/hooks/useConversationContext';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

type MarkConversationAsReadResponse = {
  conversationMarkAsRead: {
    _id: string;
    __typename: 'Conversation';
  };
};

type MarkConversationAsReadOptions = MutationHookOptions<
  MarkConversationAsReadResponse,
  { id: string }
> & {
  force?: boolean;
};

export const useConversationMarkAsRead = () => {
  const { t } = useTranslation('frontline');
  const client = useApolloClient();
  const [markAsRead] = useMutation<
    MarkConversationAsReadResponse,
    { id: string }
  >(MARK_AS_READ_CONVERSATION);
  const currentUser = useAtomValue(currentUserState);
  const { readUserIds, _id } = useConversationContext();

  const handleMarkAsRead = ({
    force = false,
    ...options
  }: MarkConversationAsReadOptions = {}) => {
    const currentUserId = currentUser?._id;

    if (
      !_id ||
      !currentUserId ||
      (!force && readUserIds?.includes(currentUserId))
    ) {
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
      refetchQueries: () =>
        [...client.getObservableQueries('active').values()]
          .filter((query) =>
            [
              'ConversationCounts',
              'FrontlineInboxSidebarWorkCounts',
              'FrontlineInboxUnreadConversationCount',
              'GetMyChannels',
              'IntegrationsGetUsedTypesByChannel',
            ].includes(query.queryName ?? ''),
          )
          .map((query) => ({
            query: query.options.query,
            variables: query.variables,
          })),
      onError: (error) => {
        toast({
          title: t('error', 'Error'),
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
            readUserIds: () => [...(readUserIds || []), currentUserId],
          },
        });
      },
    });
  };

  return {
    markAsRead: handleMarkAsRead,
  };
};
