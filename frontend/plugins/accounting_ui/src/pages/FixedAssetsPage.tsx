import { PageContainer } from 'erxes-ui';
import { EditFixedAsset } from '@/settings/fixed-assets/components/EditFixedAsset';
import { FixedAssetsTable } from '@/settings/fixed-assets/components/FixedAssetsTable';

export const FixedAssetsPage = () => {
  return (
    <PageContainer>
      <FixedAssetsTable />
      <EditFixedAsset />
    </PageContainer>
  );
};
