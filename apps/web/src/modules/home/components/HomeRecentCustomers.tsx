import { paths } from '~/lib/paths';
import { panelHref } from '~/modules/side-panel/panelNavigation';
import { useFormat } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import type { Customer } from '@erxes/core-contract';
import { useRecentCustomers } from '../hooks';
import { HOME_NS } from '../i18n';
import { HomeRecordList } from './HomeRecordList';

const customerName = (customer: Customer) =>
  [customer.firstName, customer.middleName, customer.lastName].filter(Boolean).join(' ');

/** The newest customers and leads. */
export const HomeRecentCustomers = () => {
  const { t } = useTranslation(HOME_NS);
  const fmt = useFormat();
  const { data, isPending, isError } = useRecentCustomers();

  return (
    <HomeRecordList
      title={t('widgets.recent-customers')}
      viewAllTo={paths.contacts.customers}
      emptyLabel={t('empty.customers')}
      loading={isPending}
      error={isError}
      rows={(data ?? []).map((customer) => ({
        id: customer.id,
        name:
          customerName(customer) || customer.primaryEmail || customer.primaryPhone || t('unnamed'),
        avatarUrl: customer.avatarUrl,
        detail: customerName(customer) ? customer.primaryEmail || customer.primaryPhone : null,
        meta: fmt.date(customer.createdAt, 'MMM d'),
        to: panelHref(customer.state === 'lead' ? paths.contacts.leads : paths.contacts.customers, {
          contentType: 'core:customer',
          contentId: customer.id,
        }),
      }))}
    />
  );
};
