import { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { MASTRA_WORKFLOW_RUNS } from '~/graphql/queries';
import { IWorkflowRun, IWorkflowRunsQueryResponse } from '../types';

/** Recent runs for a workflow, with live polling controls for active runs. */
export const useWorkflowRuns = (workflowId?: string, perPage = 30) => {
  const { data, loading, refetch, startPolling, stopPolling } =
    useQuery<IWorkflowRunsQueryResponse>(MASTRA_WORKFLOW_RUNS, {
      variables: { workflowId, page: 1, perPage },
      skip: !workflowId,
      fetchPolicy: 'network-only',
      notifyOnNetworkStatusChange: true,
    });

  const runs: IWorkflowRun[] = useMemo(
    () => data?.mastraWorkflowRuns ?? [],
    [data?.mastraWorkflowRuns],
  );

  return { runs, loading, refetch, startPolling, stopPolling };
};
