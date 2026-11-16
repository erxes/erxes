import { PageContainer, PageHeader } from 'erxes-ui';
import { TeamMemberFilterBar } from './header/TeamMemberFilterBar';
import { TeamMemberSettingsBreadcrumb } from './header/TeamMemberSettingsBreadcrumb';
import { TeamMemberTopbar } from './header/TeamMemberTopbar';
import { TeamMemberTable } from './TeamMemberTable';

/** Settings › Team members under the settings header; a member opens in core's side panel. */
export const TeamMembersPage = () => (
  <PageContainer>
    <PageHeader>
      <PageHeader.Start>
        <TeamMemberSettingsBreadcrumb />
      </PageHeader.Start>
      <PageHeader.End>
        <TeamMemberTopbar />
      </PageHeader.End>
    </PageHeader>
    <div className="flex w-full flex-auto flex-col overflow-hidden">
      <TeamMemberFilterBar />
      <TeamMemberTable />
    </div>
  </PageContainer>
);
