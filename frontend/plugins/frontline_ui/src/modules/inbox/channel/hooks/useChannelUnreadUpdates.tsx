import { useApolloClient, useSubscription } from '@apollo/client';
import { useAtomValue } from 'jotai';
import { currentUserState } from 'ui-modules';
import { useDebouncedCallback } from 'use-debounce';

import {
  CONVERSATION_CLIENT_MESSAGE_INSERTED,
  CONVERSATION_UNREAD_COUNT_CHANGED,
} from '@/inbox/conversations/graphql/subscriptions/inboxSubscriptions';

// A busy inbox can deliver several messages in the same second, and each one
// would otherwise cost a round trip for counts that only need to look current.
const REFRESH_DELAY = 500;

/**
 * Keeps the sidebar's workload, channel, and integration counts live. The API publishes
 * `conversationClientMessageInserted` to every member of the channel the
 * message landed in, so one subscription covers all of this user's channels;
 * active sidebar queries are then refreshed together.
 */
export const useChannelUnreadUpdates = () => {
  const client = useApolloClient();
  const currentUser = useAtomValue(currentUserState);
  const userId = currentUser?._id;

  const refetchCounts = () => {
    void client.refetchQueries({
      include: [
        'ConversationCounts',
        'FrontlineInboxSidebarWorkCounts',
        'GetMyChannels',
      ],
    });
  };

  const refreshCounts = useDebouncedCallback(refetchCounts, REFRESH_DELAY, {
    leading: true,
    trailing: true,
  });

  useSubscription(CONVERSATION_CLIENT_MESSAGE_INSERTED, {
    variables: { userId },
    skip: !userId,
    onData: () => refreshCounts(),
  });

  useSubscription<{
    conversationUnreadCountChanged: {
      channelId: string;
      unreadConversationCount: number;
    };
  }>(CONVERSATION_UNREAD_COUNT_CHANGED, {
    skip: !userId,
    onData: ({ data }) => {
      const change = data.data?.conversationUnreadCountChanged;

      if (change) {
        client.cache.modify({
          id: client.cache.identify({
            __typename: 'Channel',
            _id: change.channelId,
          }),
          fields: {
            unreadConversationCount: () => change.unreadConversationCount,
          },
        });
      }

      refreshCounts.cancel();
      refetchCounts();
    },
  });
};
