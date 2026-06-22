import { MASTRA_WORKFLOWS } from '~/graphql/queries';
import { useResourceList } from '~/components/useResourceList';
import { IWorkflow, IWorkflowsQueryResponse } from '../types';

/** All workflows for the list page. Network-only so the table reflects edits. */
export const useWorkflows = () => {
  const { items, loading, refetch } = useResourceList<
    IWorkflowsQueryResponse,
    IWorkflow
  >(MASTRA_WORKFLOWS, (data) => data?.mastraWorkflows ?? []);

  return { workflows: items, loading, refetch };
};
