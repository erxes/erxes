import { QueryHookOptions, useQuery } from '@apollo/client';
import { GET_STATUS_BY_TEAM } from '../graphql/queries/getStatusByTeam';
import { ITaskStatus } from '@/task/types';

interface IUseGetStatusByTeamResponse {
  getStatusesChoicesByTeam: ITaskStatus[];
}

export const useGetStatusByTeam = (
  options: QueryHookOptions<IUseGetStatusByTeamResponse>,
) => {
  const { data, loading, error } = useQuery<IUseGetStatusByTeamResponse>(
    GET_STATUS_BY_TEAM,
    options,
  );

  const statuses = data?.getStatusesChoicesByTeam;

  return {
    statuses: statuses || [],
    loading,
    error,
  };
};
