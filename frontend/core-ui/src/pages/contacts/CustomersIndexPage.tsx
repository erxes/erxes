import { CustomersHeader } from '@/contacts/customers/components/CustomersHeader';
import { CustomersRecordTable } from '@/contacts/customers/components/CustomersRecordTable';
import { CustomersFilter } from '@/contacts/customers/components/CustomersFilter';
import { CustomerDetail } from '@/contacts/customers/customer-detail/components/CustomerDetail';
import { PageContainer, PageSubHeader } from 'erxes-ui';
import { ContactsDetailSheet } from '@/contacts/components/ContactsDetail';
export const CustomersIndexPage = () => {
  return (
    <PageContainer>
      <CustomersHeader />
      <PageSubHeader>
        <CustomersFilter />
      </PageSubHeader>
      <CustomersRecordTable />
      <ContactsDetailSheet queryKey="contactId" title="Customer Details">
        <CustomerDetail />
      </ContactsDetailSheet>
    </PageContainer>
  );
};
