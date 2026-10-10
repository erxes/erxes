import { useTranslation } from 'react-i18next';
import { useChangeCustomerState } from '@/contacts/customers/hooks/useChangeCustomerState';
import { IconUserCheck } from '@tabler/icons-react';
import { ApolloError } from '@apollo/client';
import { Row } from '@tanstack/table-core';
import { Button, DropdownMenu, RecordTable, useToast } from 'erxes-ui';
import { ICustomer } from 'ui-modules';

const LIFECYCLE_STATES = [
  { labelKey: 'state-lead', value: 'lead' },
  { labelKey: 'state-customer', value: 'customer' },
];

type CustomerWithState = ICustomer & { state?: string };

export const CustomersChangeState = ({
  customerIds,
  rows,
}: {
  customerIds: string[];
  rows: Row<CustomerWithState>[];
}) => {
  const { changeCustomerState } = useChangeCustomerState();
  const { table } = RecordTable.useRecordTable();
  const { toast } = useToast();
  const { t } = useTranslation('contact', { keyPrefix: 'customer' });

  const currentState = rows.length === 1 ? rows[0].original.state : undefined;

  const handleSelect = async (value: string) => {
    // Clear selection BEFORE the mutation so the cache update
    // doesn't try to reconcile stale row IDs that are about to be removed.
    table.setRowSelection({});

    await changeCustomerState(customerIds, value, {
      onError: (e: ApolloError) => {
        toast({
          title: t('error-title'),
          description: e.message,
          variant: 'destructive',
        });
      },
      onCompleted: () => {
        const state = LIFECYCLE_STATES.find((s) => s.value === value);
        const label = state ? t(state.labelKey) : value;
        toast({
          title: t('success-title'),
          variant: 'success',
          description: t('state-changed', { label }),
        });
      },
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button variant="secondary">
          <IconUserCheck />
          {t('change-state')}
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        {LIFECYCLE_STATES.map((state) => (
          <DropdownMenu.Item
            key={state.value}
            onSelect={() => handleSelect(state.value)}
            className={
              currentState === state.value ? 'bg-primary/10 font-medium' : ''
            }
          >
            {t(state.labelKey)}
          </DropdownMenu.Item>
        ))}
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};
