import { useLocation } from 'react-router';
import { TeamMembersPath } from '../../constants/teamMemberRoutes';
import { InviteTeamMember } from '@/settings/team-member/components/invite/InviteTeamMember';
import { Can } from 'ui-modules';

export function TeamMemberTopbar() {
  const { pathname } = useLocation();
  if (pathname === `${TeamMembersPath.Index}${TeamMembersPath.TeamMembers}`) {
    return (
      <div className="ml-auto">
        <Can action="teamMembersInvite">
          <InviteTeamMember />
        </Can>
      </div>
    );
  }
  return null;
}
