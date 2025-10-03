import { useLocation } from 'react-router';
import { TEAM_MEMBER_SETTINGS } from '@/settings/team-member/constants/teamMemberRoutes';
import { InviteTeamMember } from '@/settings/team-member/components/invite/InviteTeamMember';

export function TeamMemberTopbar() {
  const { pathname } = useLocation();
  if (pathname === TEAM_MEMBER_SETTINGS) {
    return (
      <div className="ml-auto">
        <InviteTeamMember />
      </div>
    );
  }
  return null;
}
