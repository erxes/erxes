import { useLocation } from 'react-router-dom';
import { TeamMembersPath } from '../../constants/teamMemberRoutes';
import { InviteTeamMember } from '@/settings/team-member/components/invite/InviteTeamMember';

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
