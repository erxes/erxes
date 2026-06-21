import { useQuery } from '@apollo/client';
import { MASTRA_WORKFLOW } from '~/graphql/queries';
import { IWorkflowQueryResponse } from '../types';

/** One workflow by id. Pass `skip` when there is no id (create flow). */
export const useWorkflow = (id?: string, skip?: boolean) => {
  const { data, loading, refetch } = useQuery<IWorkflowQueryResponse>(
    MASTRA_WORKFLOW,
    {
      variables: { _id: id },
      skip: skip ?? !id,
    },
  );

  return { workflow: data?.mastraWorkflow ?? null, loading, refetch };
};
