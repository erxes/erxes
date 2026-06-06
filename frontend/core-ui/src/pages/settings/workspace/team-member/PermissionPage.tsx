import { PermissionGroups } from '@/settings/permissions/components/PermissionGroups';
import { PermissionGroupsLayout } from '@/settings/permissions/components/PermissionGroupsLayout';

export function PermissionPage() {
  return (
    <PermissionGroupsLayout>
      <PermissionGroups />
    </PermissionGroupsLayout>
  );
}
