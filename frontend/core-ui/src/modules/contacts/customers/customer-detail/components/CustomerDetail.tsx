import { Separator } from 'erxes-ui';
import { CustomerDetailActions } from './CustomerDetailActions';
import { CustomerDetailGeneral } from './CustomerDetailGeneral';
import { useCustomerDetailWithQuery } from '@/contacts/customers/hooks/useCustomerDetailWithQuery';
import { ContactsDetailLayout } from '@/contacts/components/ContactsDetail';
import { CustomerDetailFields } from './CustomerDetailFields';
import { useTranslation } from 'react-i18next';
import { FieldsInDetail } from 'ui-modules';
import { useCustomerCustomFieldEdit } from '../../hooks/useEditCustomerCustomFields';

export const CustomerDetail = () => {
  const { t } = useTranslation('contact', {
    keyPrefix: 'customer.detail',
  });
  const { customerDetail, loading } = useCustomerDetailWithQuery();

  return (
    <ContactsDetailLayout
      loading={loading}
      notFound={customerDetail === undefined}
      title={t('customer-detail')}
      actions={<CustomerDetailActions />}
    >
      <CustomerDetailGeneral />
      <Separator />
      <CustomerDetailFields />
      <Separator />
      <FieldsInDetail
        fieldContentType="core:customer"
        customFieldsData={customerDetail?.customFieldsData || {}}
        mutateHook={useCustomerCustomFieldEdit}
        id={customerDetail?._id || ''}
      />
    </ContactsDetailLayout>
  );
};
