import { PageContainer } from 'erxes-ui';
import { SettingsHeader } from 'ui-modules';
import { TeamMemberSettingsBreadcrumb } from '@/settings/team-member/components/TeamMemberSettingsBreadcrumb';
import { PermissionGroups } from '@/settings/permissions/components/PermissionGroups';
import { PermissionGroupsLayout } from '@/settings/permissions/components/PermissionGroupsLayout';

export function PermissionPage() {
  return (
    <PageContainer>
      <SettingsHeader breadcrumbs={<TeamMemberSettingsBreadcrumb />} />
      <PermissionGroupsLayout>
        <PermissionGroups />
      </PermissionGroupsLayout>
    </PageContainer>
  );
}
