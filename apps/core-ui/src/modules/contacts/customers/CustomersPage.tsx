import type { CustomerState } from '@erxes/core-contract';
import { IconAddressBook, IconPlus } from '@tabler/icons-react';
import { Button, Kbd, PageContainer, PageSubHeader, useQueryState } from 'erxes-ui';
import { useEffect } from 'react';
import { PageHeader } from 'ui-modules';
import { AppBreadcrumb } from '~/components/AppBreadcrumb';
import { CustomerDetail } from './CustomerDetail';
import { CustomerSheet } from './CustomerSheet';
import { CustomersFilter } from './CustomersFilter';
import { CustomersRecordTable } from './CustomersRecordTable';
import { CUSTOMER_SHEET_PARAM } from './useCustomers';

const CreateButton = ({ state }: { state: CustomerState }) => {
  const [, setOpenId] = useQueryState<string>(CUSTOMER_SHEET_PARAM);

  // `C` adds one, as in old core-ui, unless typing somewhere.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;

      if (
        event.key.toLowerCase() === 'c' &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey &&
        !target?.closest('input, textarea, select, [contenteditable="true"], [role="dialog"]')
      ) {
        event.preventDefault();
        setOpenId('new');
      }
    };

    window.addEventListener('keydown', onKey);

    return () => window.removeEventListener('keydown', onKey);
  }, [setOpenId]);

  return (
    <Button onClick={() => setOpenId('new')}>
      <IconPlus />
      Add {state === 'lead' ? 'lead' : 'customer'}
      <Kbd>C</Kbd>
    </Button>
  );
};

/** Contacts › Customers (or Leads): old core-ui CustomersIndexPage. */
export const CustomersPage = ({ state }: { state: CustomerState }) => (
  <PageContainer>
    <PageHeader>
      <PageHeader.Start>
        <AppBreadcrumb
          items={[
            { label: 'Contacts', to: '/contacts', icon: IconAddressBook },
            {
              label: state === 'lead' ? 'Leads' : 'Customers',
              to: state === 'lead' ? '/contacts/leads' : '/contacts/customers',
            },
          ]}
        />
      </PageHeader.Start>
      <PageHeader.End>
        <CreateButton state={state} />
      </PageHeader.End>
    </PageHeader>
    <PageSubHeader>
      <CustomersFilter state={state} />
    </PageSubHeader>
    <CustomersRecordTable state={state} />
    <CustomerSheet state={state} />
    <CustomerDetail />
  </PageContainer>
);
