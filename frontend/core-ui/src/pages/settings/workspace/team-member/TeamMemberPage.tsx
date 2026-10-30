import { TeamMemberFilterBar } from '@/settings/team-member/components/header/TeamMemberFilterBar';
import { TeamMemberTable } from '@/settings/team-member/components/TeamMemberTable';
import { useQueryState } from 'erxes-ui';
import { ResetPasswordDialog } from '@/settings/team-member/details/components/ResetPasswordDialog';
import { MemberDetail } from '@/settings/team-member/details/components/MemberDetail';
import { LdapLinkDialog } from '@/settings/ldap/components/LdapLinkDialog';

export function TeamMemberPage() {
  const [userId] = useQueryState('user_id');
  const [resetId] = useQueryState('reset_password_id');
  const [ldapLinkId] = useQueryState('ldap_link_id');

  return (
    <div className="w-full overflow-hidden flex flex-col">
      <TeamMemberFilterBar />
      <TeamMemberTable />
      {!!userId && <MemberDetail />}
      {!!resetId && <ResetPasswordDialog />}
      {!!ldapLinkId && <LdapLinkDialog />}
    </div>
  );
}
