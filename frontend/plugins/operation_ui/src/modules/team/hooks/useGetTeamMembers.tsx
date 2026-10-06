import { useQuery } from '@apollo/client';
import { GET_TEAM_MEMBERS } from '@/team/graphql/queries/getTeamMembers';
import { compactList } from '@/operation/utils/cursorList';

export const useGetTeamMembers = ({
  teamIds,
}: {
  teamIds?: string[] | string | null;
}) => {
  const getVariables = () => {
    if (Array.isArray(teamIds)) {
      return { teamIds };
    }
    return { teamId: teamIds };
  };
  const hasId = Array.isArray(teamIds)
    ? teamIds.some(Boolean)
    : Boolean(teamIds);

  const { data, loading, refetch } = useQuery(GET_TEAM_MEMBERS, {
    variables: getVariables(),
    skip: !hasId,
  });

  const members = compactList(data?.getTeamMembers);

  return { members, loading, refetch };
};
