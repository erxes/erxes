import { IconUserCog, IconUserShield } from '@tabler/icons-react';
import { Button, PageContainer } from 'erxes-ui';
import { Permission } from '@/settings/permission/components/Permission';
import { Permissions, SettingsHeader } from 'ui-modules';
import { UsersGroupSidebar } from '@/settings/permission/components/UsersGroupSidebar';

export function PermissionPage() {
  return (
    <PageContainer className="flex-row">
      <UsersGroupSidebar />
      <div className="flex-1 flex flex-col relative overflow-hidden">
        <SettingsHeader breadcrumbs={[]}>
          <Button variant="ghost" className="font-semibold">
            <IconUserCog className="w-4 h-4 text-accent-foreground" />
            Permissions
          </Button>
          <Permissions.Topbar />
        </SettingsHeader>
        <div className="flex flex-auto w-full overflow-hidden">
          <Permission />
        </div>
      </div>
    </PageContainer>
  );
}
