import { VendorsHeader } from '~/modules/insurance/components/vendors/VendorsHeader';
import { VendorsFilter } from '~/modules/insurance/components/vendors/VendorsFilter';
import { VendorsRecordTable } from '~/modules/insurance/components/vendors/VendorsRecordTable';
import { PageContainer, PageSubHeader } from 'erxes-ui';

export const VendorsPage = () => {
  return (
    <PageContainer>
      <VendorsHeader />
      <PageSubHeader>
        <VendorsFilter />
      </PageSubHeader>
      <VendorsRecordTable />
    </PageContainer>
  );
};
