import {
  ApolloError,
  useQuery,
  useSubscription,
} from '@apollo/client';
import { useAtomValue } from 'jotai';
import { currentUserState } from 'ui-modules';

import {
  CONVERSATION_COUNTS,
  CONVERSATION_FILTER_COUNTS,
  INBOX_UNREAD_CONVERSATION_COUNT,
  INBOX_SIDEBAR_WORK_COUNTS,
} from '@/inbox/conversations/graphql/queries/getConversationCounts';
import { CONVERSATION_CLIENT_MESSAGE_INSERTED } from '@/inbox/conversations/graphql/subscriptions/inboxSubscriptions';

export type TConversationCounts = Record<string, number>;

type TConversationCountsResponse = {
  conversationCounts: {
    byIntegrationTypes?: TConversationCounts;
    byIntegrations?: TConversationCounts;
  };
};

export type TInboxWorkCounts = {
  awaitingResponse: number;
  mentioned: number;
  participating: number;
  unassigned: number;
};

type TConversationFilterCountsResponse = {
  unresolved: number;
  conversationCounts: {
    unassigned?: number;
    participating?: number;
    awaitingResponse?: number;
    resolved?: number;
    responded?: number;
    standby?: number;
    handoff?: number;
  };
};

type ConversationFilterCountVariables = {
  channelId?: string | null;
  integrationId?: string | null;
  integrationType?: string | null;
  brandId?: string | null;
  startDate?: Date;
  endDate?: Date;
  searchValue?: string | null;
};

export const useConversationFilterCounts = (
  variables: ConversationFilterCountVariables,
) => {
  const { data, loading } = useQuery<TConversationFilterCountsResponse>(
    CONVERSATION_FILTER_COUNTS,
    {
      variables,
      fetchPolicy: 'cache-and-network',
    },
  );

  return {
    counts: data
      ? { ...data.conversationCounts, unresolved: data.unresolved }
      : undefined,
    loading,
  };
};

export type TUseAwaitingCountsByIntegrationTypeResult = {
  awaitingCounts: TConversationCounts;
  loading: boolean;
};

export const useAwaitingCountsByIntegrationType = ({
  channelId,
  skip,
}: {
  channelId?: string;
  skip?: boolean;
}): TUseAwaitingCountsByIntegrationTypeResult => {
  const { data, loading } = useQuery<TConversationCountsResponse>(
    CONVERSATION_COUNTS,
    {
      variables: {
        only: 'byIntegrationTypes',
        channelId,
        awaitingResponse: 'true',
      },
      skip: skip || !channelId,
      fetchPolicy: 'cache-and-network',
    },
  );

  return {
    awaitingCounts: data?.conversationCounts?.byIntegrationTypes ?? {},
    loading,
  };
};

export type TUseConversationCountsByIntegrationResult = {
  counts: TConversationCounts;
  awaitingCounts: TConversationCounts;
  loading: boolean;
};

export const useConversationCountsByIntegration = ({
  channelId,
  skip,
}: {
  channelId: string;
  skip?: boolean;
}): TUseConversationCountsByIntegrationResult => {
  const { data, loading } = useQuery<TConversationCountsResponse>(
    CONVERSATION_COUNTS,
    {
      variables: { only: 'byIntegrations', channelId },
      skip,
      fetchPolicy: 'cache-and-network',
    },
  );

  const { data: awaitingData, loading: awaitingLoading } =
    useQuery<TConversationCountsResponse>(CONVERSATION_COUNTS, {
      variables: {
        only: 'byIntegrations',
        channelId,
        awaitingResponse: 'true',
      },
      skip,
      fetchPolicy: 'cache-and-network',
    });

  return {
    counts: data?.conversationCounts?.byIntegrations ?? {},
    awaitingCounts: awaitingData?.conversationCounts?.byIntegrations ?? {},
    loading: loading || awaitingLoading,
  };
};

export type TUseInboxWorkCountsResult = {
  counts: TInboxWorkCounts;
  error: ApolloError | undefined;
  loading: boolean;
};

export const useInboxWorkCounts = (): TUseInboxWorkCountsResult => {
  const { data, loading, error } = useQuery<{
    conversationCounts?: Partial<TInboxWorkCounts>;
  }>(INBOX_SIDEBAR_WORK_COUNTS, {
    fetchPolicy: 'cache-and-network',
    variables: { unread: 'true' },
  });

  return {
    counts: {
      awaitingResponse: data?.conversationCounts?.awaitingResponse ?? 0,
      mentioned: data?.conversationCounts?.mentioned ?? 0,
      participating: data?.conversationCounts?.participating ?? 0,
      unassigned: data?.conversationCounts?.unassigned ?? 0,
    },
    error,
    loading,
  };
};

export const useInboxUnreadConversationCount = () => {
  const userId = useAtomValue(currentUserState)?._id;
  const { data, loading, refetch } = useQuery<{
    conversationsTotalCount?: number;
  }>(INBOX_UNREAD_CONVERSATION_COUNT, {
    fetchPolicy: 'cache-and-network',
  });

  useSubscription(CONVERSATION_CLIENT_MESSAGE_INSERTED, {
    variables: { userId },
    skip: !userId,
    onData: () => {
      void refetch();
    },
  });

  return {
    totalCount: data?.conversationsTotalCount ?? 0,
    loading,
  };
};
