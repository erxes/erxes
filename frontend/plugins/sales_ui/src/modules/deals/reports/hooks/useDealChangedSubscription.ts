import { useEffect } from 'react';
import { useSubscription, useApolloClient } from '@apollo/client';
import { DEAL_CHANGED } from '../graphql/subscriptions/subscriptions';

export const useDealChangedSubscription = (pipelineId?: string | null) => {
  const client = useApolloClient();

  const { data } = useSubscription(DEAL_CHANGED, {
    variables: { pipelineId: pipelineId || null },
  });

  useEffect(() => {
    if (data) {
      // Refetch all active queries to keep dashboard up‑to‑date
      client.refetchQueries({ include: 'active' });
    }
  }, [data, client]);
};