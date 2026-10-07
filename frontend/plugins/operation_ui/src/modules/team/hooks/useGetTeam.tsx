import { useQuery } from '@apollo/client';
import { GET_TEAM } from '@/team/graphql/queries/getTeam';

export const useGetTeam = (teamId?: string | null) => {
  const { data, loading, refetch, error } = useQuery(GET_TEAM, {
    variables: teamId ? { _id: teamId } : undefined,
    skip: !teamId,
  });

  const team = data?.getTeam;

  return { team, loading, refetch, error };
};
