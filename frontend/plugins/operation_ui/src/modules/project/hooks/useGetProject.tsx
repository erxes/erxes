import { IProject } from '@/project/types';
import { QueryHookOptions, useQuery } from '@apollo/client';
import { GET_PROJECT } from '@/project/graphql/queries/getProject';
import { useEffect } from 'react';
import { PROJECT_CHANGED } from '@/project/graphql/subscriptions/projectChanged';

interface IGetProjectQueryResponse {
  getProject: IProject;
}

interface IProjectChanged {
  operationProjectChanged: {
    type: string;
    project: IProject;
  };
}

export const useGetProject = (options: QueryHookOptions) => {
  const { data, loading, refetch, subscribeToMore } =
    useQuery<IGetProjectQueryResponse>(GET_PROJECT, options);

  const project = data?.getProject;

  useEffect(() => {
    if (!project?._id) return;
    const unsubscribe = subscribeToMore<IProjectChanged>({
      document: PROJECT_CHANGED,
      variables: { _id: project?._id },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;

        const newProject =
          subscriptionData.data.operationProjectChanged.project;

        return {
          getProject: newProject,
        };
      },
    });

    return () => {
      unsubscribe();
    };
  }, [project?._id, subscribeToMore]);

  return { project, loading, refetch };
};
