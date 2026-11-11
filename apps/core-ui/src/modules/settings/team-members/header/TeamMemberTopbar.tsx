import { useSession } from '~/modules/auth/session';
import { InviteTeamMember } from '../invite/InviteTeamMember';

/** The list's actions: inviting is for owners and admins (old `Can action="teamMembersInvite"`). */
export function TeamMemberTopbar() {
  const { user } = useSession();

  if (user.role === 'member') return null;

  return (
    <div className="ml-auto">
      <InviteTeamMember />
    </div>
  );
}
