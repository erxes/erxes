import { useQuery } from '@apollo/client';

import {
  CONVERSATION_COUNTS,
  CONVERSATION_FILTER_COUNTS,
} from '@/inbox/conversations/graphql/queries/getConversationCounts';

export type TConversationCounts = Record<string, number>;

type TConversationCountsResponse = {
  conversationCounts: {
    byIntegrationTypes?: TConversationCounts;
  };
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

export const useAwaitingCountsByIntegrationType = ({
  channelId,
  skip,
}: {
  channelId?: string;
  skip?: boolean;
}) => {
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
