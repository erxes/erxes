import { TeamMemberFilterBar } from '@/settings/team-member/components/header/TeamMemberFilterBar';
import { TeamMemberTable } from '@/settings/team-member/components/TeamMemberTable';
import { useQueryState } from 'erxes-ui';
import { ResetPasswordDialog } from '@/settings/team-member/details/components/ResetPasswordDialog';
import { LdapLinkDialog } from '@/settings/ldap/components/LdapLinkDialog';
import { USER_CONTENT_TYPE } from '@/settings/team-member/constants/teamMemberRoutes';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { getSidePanelRecordPath, SIDE_PANEL_QUERY_KEY } from 'ui-modules';

const useOpenMemberFromQuery = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const userId = searchParams.get('user_id');

  useEffect(() => {
    if (!userId) {
      return;
    }

    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        next.delete('user_id');
        next.set(
          SIDE_PANEL_QUERY_KEY,
          getSidePanelRecordPath({
            contentType: USER_CONTENT_TYPE,
            contentId: userId,
          }),
        );
        return next;
      },
      { replace: true },
    );
  }, [userId, setSearchParams]);
};

export function TeamMemberPage() {
  const [resetId] = useQueryState('reset_password_id');
  const [ldapLinkId] = useQueryState('ldap_link_id');

  useOpenMemberFromQuery();

  return (
    <div className="w-full overflow-hidden flex flex-col">
      <TeamMemberFilterBar />
      <TeamMemberTable />
      {!!resetId && <ResetPasswordDialog />}
      {!!ldapLinkId && <LdapLinkDialog />}
    </div>
  );
}
