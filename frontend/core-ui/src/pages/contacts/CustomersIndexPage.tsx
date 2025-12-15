import { CustomersHeader } from '@/contacts/customers/components/CustomersHeader';
import { CustomersRecordTable } from '@/contacts/customers/components/CustomersRecordTable';
import { CustomersFilter } from '@/contacts/customers/components/CustomersFilter';
import { CustomerDetail } from '@/contacts/customers/customer-detail/components/CustomerDetail';
import { PageContainer, PageSubHeader } from 'erxes-ui';
import { ContactsDetailSheet } from '@/contacts/components/ContactsDetail';
import { useTranslation } from 'react-i18next';
export const CustomersIndexPage = () => {
  const { t } = useTranslation('contact', {
    keyPrefix: 'customer.detail',
  });
  return (
    <PageContainer>
      <CustomersHeader />
      <PageSubHeader>
        <CustomersFilter />
      </PageSubHeader>
      <CustomersRecordTable />
      <ContactsDetailSheet queryKey="contactId" title={t("customer-detail")}>
        <CustomerDetail />
      </ContactsDetailSheet>
    </PageContainer>
  );
};
