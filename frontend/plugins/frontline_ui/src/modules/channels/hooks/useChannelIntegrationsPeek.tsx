import { useQuery } from '@apollo/client';
import { isDefined } from 'erxes-ui';
import { useMemo } from 'react';
import { GET_CHANNEL_INTEGRATIONS_PEEK } from '@/channels/graphql/queries';

const needsAttention = (status?: string | null) =>
  Boolean(status) && status !== 'healthy';

/** A channel's integrations, broken first and archived last. */
export const useChannelIntegrationsPeek = (channelId: string) => {
  const { data, loading, error } = useQuery(GET_CHANNEL_INTEGRATIONS_PEEK, {
    variables: { channelId },
    fetchPolicy: 'cache-and-network',
  });

  const integrations = useMemo(() => {
    const list = data?.integrations?.list?.filter(isDefined) ?? [];
    const rank = (item: (typeof list)[number]) => {
      if (needsAttention(item.healthStatus?.status)) return 0;
      if (item.isActive === false) return 2;
      return 1;
    };

    return [...list].sort((a, b) => rank(a) - rank(b));
  }, [data]);

  const brokenCount = integrations.filter((item) =>
    needsAttention(item.healthStatus?.status),
  ).length;

  return {
    integrations,
    brokenCount,
    totalCount: data?.integrations?.totalCount ?? integrations.length,
    loading: loading && !data,
    error,
    needsAttention,
  };
};
