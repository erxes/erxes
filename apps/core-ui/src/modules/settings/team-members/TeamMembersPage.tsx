import { PageContainer } from 'erxes-ui';
import { SettingsHeader } from '../components/SettingsHeader';
import { ResetPasswordDialog } from './details/ResetPasswordDialog';
import { TeamMemberSidePanel } from './details/TeamMemberSidePanel';
import { TeamMemberFilterBar } from './header/TeamMemberFilterBar';
import { TeamMemberSettingsBreadcrumb } from './header/TeamMemberSettingsBreadcrumb';
import { TeamMemberTopbar } from './header/TeamMemberTopbar';
import { TeamMemberTable } from './TeamMemberTable';

/** Settings › Team members: old core-ui TeamMemberPage under its settings header, a member opening beside it. */
export const TeamMembersPage = () => (
  <PageContainer>
    <SettingsHeader breadcrumbs={<TeamMemberSettingsBreadcrumb />}>
      <TeamMemberTopbar />
    </SettingsHeader>
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
