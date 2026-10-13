import { CustomerDetailSelectTag } from '@/contacts/customers/customer-detail/components/CustomerDetailSelectTag';
import { Button, Form, Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Can, CustomerSystemFields, useSystemFieldRules } from 'ui-modules';
import { useCustomerDetailForm } from '../../hooks/useCustomerDetailForm';
import { useCustomerDetailSubmit } from '../../hooks/useCustomerDetailSubmit';
import { useCustomerDetailWithQuery } from '../../hooks/useCustomerDetailWithQuery';

export const CustomerDetailFields = () => {
  const { t } = useTranslation('contact', { keyPrefix: 'customer' });
  const { customerDetail } = useCustomerDetailWithQuery();
  const { rules, loading } = useSystemFieldRules('core:customer', 'detail');
  const form = useCustomerDetailForm(customerDetail, rules);
  const { submit } = useCustomerDetailSubmit(customerDetail);

  if (!customerDetail) {
    return null;
  }

  if (loading) {
    return <Spinner containerClassName="py-12" />;
  }

  return (
    <div className="py-8 space-y-6">
      <CustomerDetailSelectTag
        tagIds={customerDetail.tagIds || []}
        customerId={customerDetail._id}
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(submit)} className="space-y-4 px-8">
          <CustomerSystemFields
            control={form.control}
            isShown={rules.isShown}
            isRequired={rules.isRequired}
          />
          <div className="flex justify-end">
            <Can action="contactsUpdate">
              <Button type="submit">{t('save', 'Save')}</Button>
            </Can>
          </div>
        </form>
      </Form>
    </div>
  );
};
