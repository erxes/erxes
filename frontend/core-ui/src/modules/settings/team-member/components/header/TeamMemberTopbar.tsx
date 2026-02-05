import { useLocation } from 'react-router';
import { InviteTeamMember } from '@/settings/team-member/components/invite/InviteTeamMember';
import { TeamMembersPath } from '@/settings/team-member/constants/teamMemberRoutes';

export function TeamMemberTopbar() {
  const { pathname } = useLocation();
  if (pathname === `${TeamMembersPath.Index}${TeamMembersPath.TeamMembers}`) {
    return (
      <div className="ml-auto">
        <InviteTeamMember />
      </div>
    );
  }
  return null;
}
