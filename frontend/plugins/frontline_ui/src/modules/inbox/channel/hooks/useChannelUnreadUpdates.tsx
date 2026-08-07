import { useSubscription } from '@apollo/client';
import { useAtomValue } from 'jotai';
import { currentUserState } from 'ui-modules';
import { useDebouncedCallback } from 'use-debounce';

import { CONVERSATION_CLIENT_MESSAGE_INSERTED } from '@/inbox/conversations/graphql/subscriptions/inboxSubscriptions';

// A busy inbox can deliver several messages in the same second, and each one
// would otherwise cost a round trip for counts that only need to look current.
const REFRESH_DELAY = 1000;

/**
 * Keeps the sidebar's per-channel unread counts live. The API publishes
 * `conversationClientMessageInserted` to every member of the channel the
 * message landed in, so one subscription covers all of this user's channels;
 * the counts themselves are re-read from `GetMyChannels`.
 */
export const useChannelUnreadUpdates = (refresh: () => void) => {
  const currentUser = useAtomValue(currentUserState);
  const userId = currentUser?._id;

  const refreshCounts = useDebouncedCallback(refresh, REFRESH_DELAY);

  useSubscription(CONVERSATION_CLIENT_MESSAGE_INSERTED, {
    variables: { userId },
    skip: !userId,
    onData: () => refreshCounts(),
  });
};
