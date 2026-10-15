import { useTranslation } from 'react-i18next';
import { IconUserCog } from '@tabler/icons-react';
import { Button, PageContainer } from 'erxes-ui';
import { Permission } from '@/settings/permission/components/Permission';
import { Permissions, SettingsHeader } from 'ui-modules';
import { UsersGroupSidebar } from '@/settings/permission/components/UsersGroupSidebar';

export function PermissionPage() {
  const { t } = useTranslation('settings', { keyPrefix: 'permissions' });
  return (
    <PageContainer className="flex-row">
      <UsersGroupSidebar />
      <div className="flex-1 flex flex-col relative overflow-hidden">
        <SettingsHeader breadcrumbs={[]}>
          <Button variant="ghost">
            <IconUserCog />
            {t('permissions')}
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
