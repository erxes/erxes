import { useLocation } from 'react-router';
import { TeamMembersPath } from '../../constants/teamMemberRoutes';
import { InviteTeamMember } from '@/settings/team-member/components/invite/InviteTeamMember';
import { Can } from 'ui-modules';
import { TeamAvailabilitySettingsDialog } from '@/settings/team-member/availability/components/TeamAvailabilitySettingsDialog';

export function TeamMemberTopbar() {
  const { pathname } = useLocation();
  if (pathname === `${TeamMembersPath.Index}${TeamMembersPath.TeamMembers}`) {
    return (
      <div className="ml-auto flex items-center gap-2">
        <Can action="teamMembersSetAvailability">
          <TeamAvailabilitySettingsDialog />
        </Can>
        <Can action="teamMembersInvite">
          <InviteTeamMember />
        </Can>
      </div>
    );
  }
  return null;
}
