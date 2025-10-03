import { QueryHookOptions, useQuery } from '@apollo/client';
import { GET_PROJECT_PROGRESS_BY_MEMBER } from '@/project/graphql/queries/getProjectProgressByMember';
import { IProjectProgressByMember } from '@/project/types';
import { useEffect } from 'react';
import { TASK_LIST_CHANGED } from '@/task/graphql/subscriptions/taskListChanged';

interface IGetProjectQueryResponse {
  getProjectProgressByMember: IProjectProgressByMember[];
}

export const useGetProjectProgressByMember = (options: QueryHookOptions) => {
  const { data, loading, refetch, subscribeToMore } =
    useQuery<IGetProjectQueryResponse>(GET_PROJECT_PROGRESS_BY_MEMBER, options);

  const projectProgressByMember =
    data?.getProjectProgressByMember || ([] as IProjectProgressByMember[]);

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

  return { projectProgressByMember, loading, refetch };
};
