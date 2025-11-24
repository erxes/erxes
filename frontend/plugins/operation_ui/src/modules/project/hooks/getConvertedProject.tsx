import { GET_CONVERTED_PROJECT } from '@/project/graphql/queries/getConvertedProject';
import { IProject } from '@/project/types';
import { QueryHookOptions, useQuery } from '@apollo/client';

interface IGetConvertedProjectQueryResponse {
  getConvertedProject: IProject;
}

export const useGetConvertedProject = (options: QueryHookOptions) => {
  const { data, loading, refetch } =
    useQuery<IGetConvertedProjectQueryResponse>(GET_CONVERTED_PROJECT, options);
  const project = data?.getConvertedProject;

  return { project, loading, refetch };
};
