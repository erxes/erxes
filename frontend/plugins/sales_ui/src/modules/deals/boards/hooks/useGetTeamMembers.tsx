import { GET_TEAM_MEMBERS } from '@/deals/graphql/queries/getTeamMembers';
import { IUser } from 'ui-modules';
import { useQuery } from '@apollo/client';

interface IGetTeamMembersQueryResponse {
  getTeamMembers: ITeamMember[];
}

export interface ITeamMember {
  _id: string;
  memberId: string;
  teamId: string;

  member: IUser;
  role: string;
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
