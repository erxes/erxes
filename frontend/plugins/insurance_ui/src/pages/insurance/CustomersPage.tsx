import { CustomersHeader } from '~/modules/insurance/components/customers/CustomersHeader';
import { CustomersFilter } from '~/modules/insurance/components/customers/CustomersFilter';
import { CustomersRecordTable } from '~/modules/insurance/components/customers/CustomersRecordTable';
import { PageContainer, PageSubHeader } from 'erxes-ui';

export const CustomersPage = () => {
  return (
    <PageContainer>
      <CustomersHeader />
      <PageSubHeader>
        <CustomersFilter />
      </PageSubHeader>
      <CustomersRecordTable />
    </PageContainer>
  );
};
