import { PermissionsTable } from '@/settings/permission-settings/components/PermissionsTable';
import { PermissionsFilter } from '@/settings/permission-settings/components/PermissionsFilter';
import { PageContainer, PageSubHeader } from 'erxes-ui';

export const PermissionsPage = () => {
  return (
    <PageContainer>
      <PageSubHeader>
        <PermissionsFilter />
      </PageSubHeader>
      <PermissionsTable />
    </PageContainer>
  );
};
