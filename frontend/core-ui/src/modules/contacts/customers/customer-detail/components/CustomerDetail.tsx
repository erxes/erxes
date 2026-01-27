import { ContactsDetailLayout } from '@/contacts/components/ContactsDetail';
import { useCustomerDetailWithQuery } from '@/contacts/customers/hooks/useCustomerDetailWithQuery';
import { Separator } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { ActivityLogs, FieldsInDetail } from 'ui-modules';
import { useCustomerCustomFieldEdit } from '../../hooks/useEditCustomerCustomFields';
import { CustomerDetailActions } from './CustomerDetailActions';
import { CustomerDetailFields } from './CustomerDetailFields';
import { CustomerDetailGeneral } from './CustomerDetailGeneral';

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
      <div className="p-8">
        <FieldsInDetail
          fieldContentType="core:customer"
          customFieldsData={customerDetail?.customFieldsData || {}}
          mutateHook={useCustomerCustomFieldEdit}
          id={customerDetail?._id || ''}
        />
      </div>
      <Separator />
      {customerDetail && <ActivityLogs targetId={customerDetail?._id} />}
    </ContactsDetailLayout>
  );
};
