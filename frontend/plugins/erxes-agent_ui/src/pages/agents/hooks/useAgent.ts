import { useQuery } from '@apollo/client';
import { MASTRA_AGENT } from '~/graphql/queries';
import { IMastraAgentResponse } from '../types';

/** Fetches a single agent for the edit form; skipped on the create route. */
export const useAgent = (id?: string) => {
  const { data, loading } = useQuery<IMastraAgentResponse>(MASTRA_AGENT, {
    variables: { _id: id },
    skip: !id,
  });

  return { agent: data?.mastraAgent ?? null, loading };
};
