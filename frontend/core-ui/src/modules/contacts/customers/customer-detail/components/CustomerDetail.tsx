import { Separator } from 'erxes-ui';
import { CustomerDetailActions } from './CustomerDetailActions';
import { CustomerDetailGeneral } from './CustomerDetailGeneral';
import { useCustomerDetailWithQuery } from '@/contacts/customers/hooks/useCustomerDetailWithQuery';
import { ContactsDetailLayout } from '@/contacts/components/ContactsDetail';
import { CustomerDetailFields } from './CustomerDetailFields';

export const CustomerDetail = () => {
  const { customerDetail, loading } = useCustomerDetailWithQuery();

  return (
    <ContactsDetailLayout
      loading={loading}
      notFound={customerDetail === undefined}
      title="Customer Details"
      actions={<CustomerDetailActions />}
    >
      <CustomerDetailGeneral />
      <Separator />
      <CustomerDetailFields />
    </ContactsDetailLayout>
  );
};
