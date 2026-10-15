import { QueryHookOptions, useQuery } from '@apollo/client';
import { GET_STATUS_BY_TEAM } from '../graphql/queries/getStatusByTeam';
import { compactList } from '@/operation/utils/cursorList';
import {
  GetStatusByTeamQuery,
  GetStatusByTeamQueryVariables,
} from '~/gql/graphql';

export const useGetStatusByTeam = (
  options: QueryHookOptions<
    GetStatusByTeamQuery,
    GetStatusByTeamQueryVariables
  >,
) => {
  const { data, loading, error } = useQuery(GET_STATUS_BY_TEAM, options);

  const statuses = compactList(data?.getStatusesChoicesByTeam);

  return {
    statuses,
    loading,
    error,
  };
};
