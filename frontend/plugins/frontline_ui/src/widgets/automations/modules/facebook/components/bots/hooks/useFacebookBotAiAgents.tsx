import { useQuery } from '@apollo/client';
import { useMemo } from 'react';
import { FACEBOOK_BOT_AI_AGENTS } from '~/widgets/automations/modules/facebook/components/bots/graphql/botAiAgentsQueries';

export type TBotAiAgent = {
  _id: string;
  name: string;
};

const isAiAgent = (value: unknown): value is TBotAiAgent =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as TBotAiAgent)._id === 'string' &&
  typeof (value as TBotAiAgent).name === 'string';

/** Network-first, so an agent created a moment ago shows on return. */
export const useFacebookBotAiAgents = (skip: boolean) => {
  const { data, loading, error } = useQuery(FACEBOOK_BOT_AI_AGENTS, {
    skip,
    fetchPolicy: 'cache-and-network',
  });

  const agents = useMemo(() => {
    const list = data?.automationsAiAgents;

    return Array.isArray(list) ? list.filter(isAiAgent) : [];
  }, [data]);

  return { agents, loading, error };
};
