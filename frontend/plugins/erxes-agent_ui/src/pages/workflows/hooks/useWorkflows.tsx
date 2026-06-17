import { useQuery } from '@apollo/client';
import { MASTRA_WORKFLOWS } from '~/graphql/queries';
import { IWorkflow, IWorkflowsQueryResponse } from '../types';

/** All workflows for the list page. Network-only so the table reflects edits. */
export const useWorkflows = () => {
  const { data, loading, refetch } = useQuery<IWorkflowsQueryResponse>(
    MASTRA_WORKFLOWS,
    {
      fetchPolicy: 'network-only',
      notifyOnNetworkStatusChange: true,
    },
  );

  const workflows: IWorkflow[] = data?.mastraWorkflows ?? [];

  return { workflows, loading, refetch };
};
