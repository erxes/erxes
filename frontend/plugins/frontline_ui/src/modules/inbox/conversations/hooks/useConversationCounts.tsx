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

/**
 * Open conversations per integration kind inside one channel, together with the
 * subset the customer spoke last in — what the sidebar marks with a dot. Both
 * are skipped while the channel is collapsed, so a closed group costs nothing.
 */
export const useConversationCountsByIntegrationType = ({
  channelId,
  skip,
}: {
  channelId?: string;
  skip?: boolean;
}) => {
  const disabled = skip || !channelId;

  const { data, loading } = useQuery<TConversationCountsResponse>(
    CONVERSATION_COUNTS,
    {
      variables: { only: 'byIntegrationTypes', channelId },
      skip: disabled,
      fetchPolicy: 'cache-and-network',
    },
  );

  const { data: awaitingData } = useQuery<TConversationCountsResponse>(
    CONVERSATION_COUNTS,
    {
      variables: {
        only: 'byIntegrationTypes',
        channelId,
        awaitingResponse: 'true',
      },
      skip: disabled,
      fetchPolicy: 'cache-and-network',
    },
  );

  return {
    counts: data?.conversationCounts?.byIntegrationTypes ?? {},
    awaitingCounts: awaitingData?.conversationCounts?.byIntegrationTypes ?? {},
    loading,
  };
};
