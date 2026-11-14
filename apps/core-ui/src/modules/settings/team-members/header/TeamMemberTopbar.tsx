import { useCan } from '~/modules/auth/session';
import { InviteTeamMember } from '../invite/InviteTeamMember';

/** The list's actions: inviting is for owners and admins. */
export function TeamMemberTopbar() {
  const can = useCan();

  if (!can('team.invite')) return null;

  return <InviteTeamMember />;
}
