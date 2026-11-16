import { useCan } from '~/modules/auth/session';
import { AddWithoutSignIn } from '../invite/AddWithoutSignIn';
import { InviteTeamMember } from '../invite/InviteTeamMember';

/** The list's actions: inviting, and adding people who don't sign in, are for owners and admins. */
export function TeamMemberTopbar() {
  const can = useCan();

  if (!can('team.invite')) return null;

  return (
    <div className="flex items-center gap-2">
      <AddWithoutSignIn />
      <InviteTeamMember />
    </div>
  );
}
