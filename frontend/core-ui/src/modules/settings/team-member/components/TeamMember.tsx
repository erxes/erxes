import { TeamMemberTable } from '@/settings/team-member/components/TeamMemberTable';
import { TeamMemberSettingsBreadcrumb } from '@/settings/team-member/components/TeamMemberSettingsBreadcrumb';
import { TeamMemberTopbar } from '@/settings/team-member/components/header/TeamMemberTopbar';
import { TeamMemberFilterBar } from '@/settings/team-member/components/header/TeamMemberFilterBar';
import { SettingsHeader } from 'ui-modules';

export const TeamMember = () => {
  return (
    <>
      <SettingsHeader breadcrumbs={<TeamMemberSettingsBreadcrumb />}>
        <TeamMemberTopbar />
      </SettingsHeader>
      <div className="flex flex-auto w-full overflow-hidden">
        <div className="w-full overflow-hidden flex flex-col">
          <TeamMemberFilterBar />
          <TeamMemberTable />
        </div>
      </div>
    </>
  );
};
