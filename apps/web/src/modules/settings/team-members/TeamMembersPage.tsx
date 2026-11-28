import { ListFilter, PageContainer, PageHeader, ViewBar } from 'erxes-ui';
import { memberQueries } from '@erxes/core-contract/client';
import { useTranslation } from 'react-i18next';
import { useMemberFilterFields } from './header/useMemberFilterFields';
import { TeamMemberSettingsBreadcrumb } from './header/TeamMemberSettingsBreadcrumb';
import { TeamMemberTopbar } from './header/TeamMemberTopbar';
import { TEAM_MEMBER_LIST } from './constants';
import { TeamMemberTable } from './TeamMemberTable';
import { useTeamMembers } from './useTeamMembers';

/** The list's filter, on the right of its bar as on customers, with how many members match. */
const TeamMemberFilter = () => {
  const { totalCount } = useTeamMembers();

  return (
    <ListFilter
      id={TEAM_MEMBER_LIST}
      fields={useMemberFilterFields()}
      members={memberQueries}
      totalCount={totalCount}
    />
  );
};

/**
 * Settings › Team members, as core's customers list draws itself: the breadcrumb and the actions,
 * then one bar with the list's tab on the left and its filter on the right. A member opens in
 * core's side panel.
 */
export const TeamMembersPage = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });

  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start>
          <TeamMemberSettingsBreadcrumb />
        </PageHeader.Start>
        <PageHeader.End>
          <TeamMemberTopbar />
        </PageHeader.End>
      </PageHeader>
      <ViewBar allLabel={t('all-team-members', 'All team members')}>
        <TeamMemberFilter />
      </ViewBar>
      <TeamMemberTable />
    </PageContainer>
  );
};
