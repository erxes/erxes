import { useQuery } from '@apollo/client';
import { MASTRA_AGENTS } from '~/graphql/queries';
import { IScheduleAgentOption, IScheduleAgentsQueryResponse } from '../types';

/** Enabled agents a schedule can run against, for the agent picker. */
export const useScheduleAgents = () => {
  const { data, loading } =
    useQuery<IScheduleAgentsQueryResponse>(MASTRA_AGENTS);

  const agents: IScheduleAgentOption[] = (data?.mastraAgents ?? []).filter(
    (a) => a.isEnabled,
  );

  return { agents, loading };
};
