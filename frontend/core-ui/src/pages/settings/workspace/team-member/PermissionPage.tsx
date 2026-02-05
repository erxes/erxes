import { Permission } from '@/settings/permission/components/Permission';
import { PageContainer } from 'erxes-ui';
import { SettingsHeader } from 'ui-modules';
import { TeamMemberSettingsBreadcrumb } from '@/settings/team-member/components/TeamMemberSettingsBreadcrumb';

export function PermissionPage() {
  return (
    <PageContainer>
      <SettingsHeader breadcrumbs={<TeamMemberSettingsBreadcrumb />} />
      <div className="flex flex-auto w-full overflow-hidden">
        <h1>123</h1>
      </div>
    </PageContainer>
  );
}
