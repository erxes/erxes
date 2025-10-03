import { ITeamMemberDocument } from '@/team/@types/team';

export const TeamMember = {
  member(teamMember: ITeamMemberDocument) {
    return (
      teamMember.memberId && { __typename: 'User', _id: teamMember.memberId }
    );
  },
};
