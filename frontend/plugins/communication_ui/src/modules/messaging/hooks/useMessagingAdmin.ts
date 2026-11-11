import { useQuery } from '@apollo/client';
import {
  MESSAGING_ADMIN_APPS,
  MESSAGING_ADMIN_CONVERSATION,
  MESSAGING_ADMIN_CONVERSATIONS,
  MESSAGING_ADMIN_MESSAGES,
  MESSAGING_ADMIN_PARTICIPANTS,
} from '../graphql/queries';
import type { MessagingKind, SelectedConversation } from '../types';

const PAGE_SIZE = 25;

export const useMessagingAdminApps = () => {
  const { data, loading, error } = useQuery(MESSAGING_ADMIN_APPS);
  return {
    apps: data?.communicationMessagingAdminApps ?? [],
    loading,
    error,
  };
};

export const useMessagingAdminConversations = (filters: {
  appKey: string | null;
  kind: MessagingKind;
  search: string;
}) => {
  const { data, loading, error, fetchMore, refetch, networkStatus } = useQuery(
    MESSAGING_ADMIN_CONVERSATIONS,
    {
      variables: {
        appKey: filters.appKey,
        kind: filters.kind,
        search: filters.search || null,
        first: PAGE_SIZE,
      },
      fetchPolicy: 'cache-and-network',
      notifyOnNetworkStatusChange: true,
    },
  );
  const page = data?.communicationMessagingAdminConversations;

  const loadMore = () =>
    page?.nextCursor
      ? fetchMore({
          variables: { after: page.nextCursor },
          updateQuery: (previous, { fetchMoreResult }) => ({
            communicationMessagingAdminConversations: {
              ...fetchMoreResult.communicationMessagingAdminConversations,
              items: [
                ...previous.communicationMessagingAdminConversations.items,
                ...fetchMoreResult.communicationMessagingAdminConversations
                  .items,
              ],
            },
          }),
        })
      : undefined;

  return {
    conversations: page?.items ?? [],
    hasMore: Boolean(page?.nextCursor),
    loading: loading && !page,
    loadingMore: networkStatus === 3,
    error,
    loadMore,
    refetch,
  };
};

export const useMessagingAdminConversation = ({
  appKey,
  id,
}: SelectedConversation) => {
  const { data, loading, error, refetch } = useQuery(
    MESSAGING_ADMIN_CONVERSATION,
    { variables: { appKey, id }, fetchPolicy: 'network-only' },
  );
  return {
    conversation: data?.communicationMessagingAdminConversation,
    loading,
    error,
    refetch,
  };
};

export const useMessagingAdminMessages = ({
  appKey,
  id,
}: SelectedConversation) => {
  const { data, loading, error, fetchMore, refetch, networkStatus } = useQuery(
    MESSAGING_ADMIN_MESSAGES,
    {
      variables: { appKey, conversationId: id, first: PAGE_SIZE },
      fetchPolicy: 'network-only',
      notifyOnNetworkStatusChange: true,
    },
  );
  const page = data?.communicationMessagingAdminMessages;

  // History pages arrive in ascending order; older pages go first.
  const loadOlder = () =>
    page?.nextCursor
      ? fetchMore({
          variables: { before: page.nextCursor },
          updateQuery: (previous, { fetchMoreResult }) => ({
            communicationMessagingAdminMessages: {
              ...fetchMoreResult.communicationMessagingAdminMessages,
              items: [
                ...fetchMoreResult.communicationMessagingAdminMessages.items,
                ...previous.communicationMessagingAdminMessages.items,
              ],
            },
          }),
        })
      : undefined;

  return {
    messages: page?.items ?? [],
    hasOlder: Boolean(page?.nextCursor),
    loading: loading && !page,
    loadingOlder: networkStatus === 3,
    error,
    loadOlder,
    refetch,
  };
};

export const useMessagingAdminParticipants = ({
  appKey,
  id,
}: SelectedConversation) => {
  const { data, loading, error, refetch } = useQuery(
    MESSAGING_ADMIN_PARTICIPANTS,
    {
      variables: { appKey, conversationId: id },
      fetchPolicy: 'network-only',
    },
  );
  return {
    participants: data?.communicationMessagingAdminParticipants ?? [],
    loading,
    error,
    refetch,
  };
};
