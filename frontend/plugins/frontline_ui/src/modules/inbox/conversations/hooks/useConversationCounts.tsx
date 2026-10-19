import { ApolloError, useQuery, useSubscription } from '@apollo/client';
import { useAtomValue } from 'jotai';
import { currentUserState } from 'ui-modules';

import {
  CONVERSATION_COUNTS,
  CONVERSATION_FILTER_COUNTS,
  INBOX_UNREAD_CONVERSATION_COUNT,
  INBOX_SIDEBAR_WORK_COUNTS,
} from '@/inbox/conversations/graphql/queries/getConversationCounts';
import { CONVERSATION_CLIENT_MESSAGE_INSERTED } from '@/inbox/conversations/graphql/subscriptions/inboxSubscriptions';
import {
  readCount,
  readCountMap,
} from '@/inbox/conversations/utils/conversationCounts';
import type { FrontlineInboxConversationFilterCountsQueryVariables } from '~/gql/graphql';

export type TConversationCounts = Record<string, number>;

export type TInboxWorkCounts = {
  awaitingResponse: number;
  mentioned: number;
  participating: number;
  unassigned: number;
};

export const useConversationFilterCounts = (
  variables: FrontlineInboxConversationFilterCountsQueryVariables,
) => {
  const { data, loading } = useQuery(CONVERSATION_FILTER_COUNTS, {
    variables,
    fetchPolicy: 'cache-and-network',
  });

  const conversationCounts = data?.conversationCounts;

  return {
    counts: data
      ? {
          unassigned: readCount(conversationCounts, 'unassigned'),
          participating: readCount(conversationCounts, 'participating'),
          awaitingResponse: readCount(conversationCounts, 'awaitingResponse'),
          resolved: readCount(conversationCounts, 'resolved'),
          responded: readCount(conversationCounts, 'responded'),
          standby: readCount(conversationCounts, 'standby'),
          handoff: readCount(conversationCounts, 'handoff'),
          unresolved: data.unresolved ?? undefined,
        }
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
  const { data, loading } = useQuery(CONVERSATION_COUNTS, {
    variables: {
      only: 'byIntegrationTypes',
      channelId,
      awaitingResponse: 'true',
    },
    skip: skip || !channelId,
    fetchPolicy: 'cache-and-network',
  });

  return {
    awaitingCounts: readCountMap(
      data?.conversationCounts,
      'byIntegrationTypes',
    ),
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
  const { data, loading } = useQuery(CONVERSATION_COUNTS, {
    variables: { only: 'byIntegrations', channelId },
    skip,
    fetchPolicy: 'cache-and-network',
  });

  const { data: awaitingData, loading: awaitingLoading } = useQuery(
    CONVERSATION_COUNTS,
    {
      variables: {
        only: 'byIntegrations',
        channelId,
        awaitingResponse: 'true',
      },
      skip,
      fetchPolicy: 'cache-and-network',
    },
  );

  return {
    counts: readCountMap(data?.conversationCounts, 'byIntegrations'),
    awaitingCounts: readCountMap(
      awaitingData?.conversationCounts,
      'byIntegrations',
    ),
    loading: loading || awaitingLoading,
  };
};

export type TUseInboxWorkCountsResult = {
  counts: TInboxWorkCounts;
  error: ApolloError | undefined;
  loading: boolean;
};

export const useInboxWorkCounts = (): TUseInboxWorkCountsResult => {
  const { data, loading, error } = useQuery(INBOX_SIDEBAR_WORK_COUNTS, {
    fetchPolicy: 'cache-and-network',
    variables: { unread: 'true' },
  });

  return {
    counts: {
      awaitingResponse:
        readCount(data?.conversationCounts, 'awaitingResponse') ?? 0,
      mentioned: readCount(data?.conversationCounts, 'mentioned') ?? 0,
      participating: readCount(data?.conversationCounts, 'participating') ?? 0,
      unassigned: readCount(data?.conversationCounts, 'unassigned') ?? 0,
    },
    error,
    loading,
  };
};

export const useInboxUnreadConversationCount = () => {
  const userId = useAtomValue(currentUserState)?._id;
  const { data, loading, refetch } = useQuery(INBOX_UNREAD_CONVERSATION_COUNT, {
    fetchPolicy: 'cache-and-network',
  });

  useSubscription(CONVERSATION_CLIENT_MESSAGE_INSERTED, {
    variables: userId ? { userId } : undefined,
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
