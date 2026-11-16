import { LdapLinkDialog } from '@/settings/ldap/components/LdapLinkDialog';
import {
  TeamMembersPath,
  USER_CONTENT_TYPE,
} from '@/settings/team-member/constants/teamMemberRoutes';
import { MemberDetail } from '@/settings/team-member/details/components/MemberDetail';
import { ResetPasswordDialog } from '@/settings/team-member/details/components/ResetPasswordDialog';
import { PageContainer, useQueryState } from 'erxes-ui';
import { useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ISidePanelNavigator,
  RecordSidePanel,
  SidePanelNavigatorContext,
  useSidePanel,
} from 'ui-modules';

/** The member's own page, with related records opening beside it. */
export const TeamMemberDetailPage = () => {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { openRecord } = useSidePanel();
  const [tab, setTab] = useQueryState<string>('tab');
  const [resetId] = useQueryState<string>('reset_password_id');
  const [ldapLinkId] = useQueryState<string>('ldap_link_id');
  const record = useMemo(
    () => ({ contentType: USER_CONTENT_TYPE, contentId: id }),
    [id],
  );
  const listPath = `${TeamMembersPath.Index}${TeamMembersPath.TeamMembers}`;
  const backToList = useCallback(
    () => navigate(listPath),
    [navigate, listPath],
  );
  const navigator = useMemo<ISidePanelNavigator>(
    () => ({
      record,
      tab: tab ?? '',
      setTab,
      openRecord,
      back: backToList,
      canGoBack: false,
      close: backToList,
      listPath,
    }),
    [record, tab, setTab, openRecord, backToList, listPath],
  );

  return (
    <PageContainer className="min-w-0 flex-1">
      <SidePanelNavigatorContext.Provider value={navigator}>
        <RecordSidePanel expanded expandedMode="page" expandable={false}>
          <MemberDetail key={id} />
        </RecordSidePanel>
        {!!resetId && <ResetPasswordDialog />}
        {!!ldapLinkId && <LdapLinkDialog />}
      </SidePanelNavigatorContext.Provider>
    </PageContainer>
  );
};
