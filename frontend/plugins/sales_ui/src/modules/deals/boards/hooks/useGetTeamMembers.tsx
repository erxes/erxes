import { GET_TEAM_MEMBERS } from '@/deals/graphql/queries/getTeamMembers';
import { useQuery } from '@apollo/client';
import { isDefined } from 'erxes-ui';

export const useGetTeamMembers = ({
  teamIds,
}: {
  teamIds?: string[] | string;
}) => {
  const getVariables = () => {
    if (Array.isArray(teamIds)) {
      return { teamIds };
    }
    return { teamId: teamIds };
  };
  const { data, loading, refetch } = useQuery(GET_TEAM_MEMBERS, {
    variables: getVariables(),
  });

  const members = data?.getTeamMembers?.filter(isDefined);

  return { members, loading, refetch };
};
