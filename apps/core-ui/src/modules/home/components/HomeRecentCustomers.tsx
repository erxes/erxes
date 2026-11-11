import { useTranslation } from 'react-i18next';
import type { Customer } from '@erxes/core-contract';
import { useRecentCustomers } from '../hooks';
import { HOME_NS } from '../i18n';
import { HomeRecordList } from './HomeRecordList';

const customerName = (customer: Customer) =>
  [customer.firstName, customer.middleName, customer.lastName].filter(Boolean).join(' ');

const shortDate = (value: string, language: string) =>
  new Date(value).toLocaleDateString(language, { month: 'short', day: 'numeric' });

/** The newest customers and leads. */
export const HomeRecentCustomers = () => {
  const { t, i18n } = useTranslation(HOME_NS);
  const { data, isPending, isError } = useRecentCustomers();

  return (
    <HomeRecordList
      title={t('widgets.recent-customers')}
      viewAllTo="/contacts/customers"
      emptyLabel={t('empty.customers')}
      loading={isPending}
      error={isError}
      rows={(data ?? []).map((customer) => ({
        id: customer.id,
        name:
          customerName(customer) || customer.primaryEmail || customer.primaryPhone || t('unnamed'),
        avatarUrl: customer.avatarUrl,
        detail: customerName(customer) ? customer.primaryEmail || customer.primaryPhone : null,
        meta: shortDate(customer.createdAt, i18n.language),
        to: `/contacts/${customer.state === 'lead' ? 'leads' : 'customers'}?customerId=${customer.id}`,
      }))}
    />
  );
};
