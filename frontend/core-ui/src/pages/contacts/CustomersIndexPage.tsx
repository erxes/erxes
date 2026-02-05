import { CustomersHeader } from '@/contacts/customers/components/CustomersHeader';
import { CustomersRecordTable } from '@/contacts/customers/components/CustomersRecordTable';
import { CustomersFilter } from '@/contacts/customers/components/CustomersFilter';
import { PageContainer, PageSubHeader } from 'erxes-ui';
import { Import } from 'ui-modules';
import { Export } from 'ui-modules/modules/import-export/components/epxort/Export';
import { useCustomersVariables } from '@/contacts/customers/hooks/useCustomers';
import { CustomerDetail } from '@/contacts/customers/customer-detail/components/CustomerDetail';

export const CustomersIndexPage = () => {
  const variables = useCustomersVariables();

  const getFilters = () => {
    const { cursor, limit, orderBy, ...filters } = variables;
    return filters;
  };

  return (
    <PageContainer>
      <CustomersHeader />
      <PageSubHeader>
        <CustomersFilter />
        <Import
          pluginName="core"
          moduleName="contact"
          collectionName="customer"
        />
        <Export
          pluginName="core"
          moduleName="contact"
          collectionName="customer"
          getFilters={getFilters}
        />
      </PageSubHeader>
      <CustomersRecordTable />
      <CustomerDetail />
    </PageContainer>
  );
};
