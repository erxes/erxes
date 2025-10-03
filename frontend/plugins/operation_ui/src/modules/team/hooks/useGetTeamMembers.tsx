import { useQuery } from '@apollo/client';
import { GET_TEAM_MEMBERS } from '@/team/graphql/queries/getTeamMembers';
import { ITeamMember } from '@/team/types';

interface IGetTeamMembersQueryResponse {
  getTeamMembers: ITeamMember[];
}

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
  const { data, loading, refetch } = useQuery<IGetTeamMembersQueryResponse>(
    GET_TEAM_MEMBERS,
    {
      variables: getVariables(),
    },
  );

  const members = data?.getTeamMembers;

  return { members, loading, refetch };
};
