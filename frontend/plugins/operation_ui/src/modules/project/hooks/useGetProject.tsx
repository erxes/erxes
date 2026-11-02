import { QueryHookOptions, useQuery } from '@apollo/client';
import { GET_PROJECT } from '@/project/graphql/queries/getProject';
import { useEffect } from 'react';
import { PROJECT_CHANGED } from '@/project/graphql/subscriptions/projectChanged';
import type { GetProjectQuery, GetProjectQueryVariables } from '~/gql/graphql';

export const useGetProject = (
  projectId?: string | null,
  {
    subscribe = true,
    ...options
  }: Omit<
    QueryHookOptions<GetProjectQuery, GetProjectQueryVariables>,
    'variables'
  > & {
    // Table cells read only the name; skipping the live subscription keeps
    // each row from opening its own socket subscription.
    subscribe?: boolean;
  } = {},
) => {
  const { data, loading, refetch, subscribeToMore, error } = useQuery(
    GET_PROJECT,
    {
      ...options,
      variables: projectId ? { _id: projectId } : undefined,
      skip: !projectId || options.skip,
    },
  );

  const project = data?.getProject;

  useEffect(() => {
    if (!subscribe || !project?._id) return;
    const unsubscribe = subscribeToMore({
      document: PROJECT_CHANGED,
      variables: { _id: project._id },
      updateQuery: (prev, { subscriptionData }) => {
        const changed = subscriptionData.data?.operationProjectChanged?.project;
        if (!prev.getProject || !changed) return prev;

        return {
          ...prev,
          getProject: { ...prev.getProject, ...changed },
        };
      },
    });

    return () => {
      unsubscribe();
    };
  }, [project?._id, subscribe, subscribeToMore]);

  return { project, loading, refetch, error };
};
