import { QueryHookOptions, useQuery } from '@apollo/client';
import { TASK_LIST_CHANGED } from '@/task/graphql/subscriptions/taskListChanged';
import { IProjectProgress } from '@/project/types';
import { GET_PROJECT_PROGRESS } from '@/project/graphql/queries/getProjectProgress';
import { useEffect } from 'react';

interface IGetProjectQueryResponse {
  getProjectProgress: IProjectProgress;
}

interface IGetProjectQueryVariables {
  _id: string;
}

export const useGetProjectProgress = (
  options: QueryHookOptions<
    IGetProjectQueryResponse,
    IGetProjectQueryVariables
  >,
) => {
  const { data, loading, refetch, subscribeToMore } = useQuery<
    IGetProjectQueryResponse,
    IGetProjectQueryVariables
  >(GET_PROJECT_PROGRESS, options);

  useEffect(() => {
    const unsubscribe = subscribeToMore({
      document: TASK_LIST_CHANGED,
      variables: { filter: { projectId: options.variables?._id } },
      updateQuery: () => {
        refetch();
      },
    });

    return () => {
      unsubscribe();
    };
  }, [options.variables?._id, subscribeToMore, refetch]);

  const projectProgress = data?.getProjectProgress;

  return { projectProgress, loading, refetch };
};
