import { GET_CONVERTED_PROJECT } from '@/project/graphql/queries/getConvertedProject';
import { QueryHookOptions, useQuery } from '@apollo/client';
import type {
  GetConvertedProjectQuery,
  GetConvertedProjectQueryVariables,
} from '~/gql/graphql';

export const useGetConvertedProject = (
  options: QueryHookOptions<
    GetConvertedProjectQuery,
    GetConvertedProjectQueryVariables
  >,
) => {
  const { data, loading, refetch } = useQuery(GET_CONVERTED_PROJECT, options);
  const project = data?.getConvertedProject;

  return { project, loading, refetch };
};
