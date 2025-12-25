import { CustomersHeader } from '@/contacts/customers/components/CustomersHeader';
import { CustomersRecordTable } from '@/contacts/customers/components/CustomersRecordTable';
import { CustomersFilter } from '@/contacts/customers/components/CustomersFilter';
import { CustomerDetail } from '@/contacts/customers/customer-detail/components/CustomerDetail';
import { PageContainer, PageSubHeader } from 'erxes-ui';
import { ContactsDetailSheet } from '@/contacts/components/ContactsDetail';
import { useTranslation } from 'react-i18next';
import { Import } from 'ui-modules';
import { Export } from 'ui-modules/modules/import-export/components/epxort/Export';
import { useCustomersVariables } from '@/contacts/customers/hooks/useCustomers';

export const CustomersIndexPage = () => {
  const { t } = useTranslation('contact', {
    keyPrefix: 'customer.detail',
  });


export const CustomersIndexPage = () => {
  const variables = useCustomersVariables();

  const getFilters = () => {
    // Remove cursor-related fields and internal fields that shouldn't be in filters
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
      <ContactsDetailSheet queryKey="contactId" title={t("customer-detail")}>
        <CustomerDetail />
      </ContactsDetailSheet>
    </PageContainer>
  );
};
