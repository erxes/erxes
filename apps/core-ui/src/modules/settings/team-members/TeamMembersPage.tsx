import { PageContainer, PageHeader } from 'erxes-ui';
import { ResetPasswordDialog } from './details/ResetPasswordDialog';
import { TeamMemberSidePanel } from './details/TeamMemberSidePanel';
import { TeamMemberFilterBar } from './header/TeamMemberFilterBar';
import { TeamMemberSettingsBreadcrumb } from './header/TeamMemberSettingsBreadcrumb';
import { TeamMemberTopbar } from './header/TeamMemberTopbar';
import { TeamMemberTable } from './TeamMemberTable';

/** Settings › Team members under the settings header, a member opening beside the list. */
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
    <div className="flex flex-auto w-full overflow-hidden">
      <div className="w-full overflow-hidden flex flex-col">
        <TeamMemberFilterBar />
        <TeamMemberTable />
      </div>
      <TeamMemberSidePanel />
    </div>
    <ResetPasswordDialog />
  </PageContainer>
);
