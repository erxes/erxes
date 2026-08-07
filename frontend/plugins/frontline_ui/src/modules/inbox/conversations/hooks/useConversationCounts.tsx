import { useQuery } from '@apollo/client';

import { CONVERSATION_COUNTS } from '@/inbox/conversations/graphql/queries/getConversationCounts';

export type TConversationCounts = Record<string, number>;

type TConversationCountsResponse = {
  conversationCounts: {
    byIntegrationTypes?: TConversationCounts;
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
