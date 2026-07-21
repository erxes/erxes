import { useChangeCustomerState } from '@/contacts/customers/hooks/useChangeCustomerState';
import { IconUserCheck } from '@tabler/icons-react';
import { ApolloError } from '@apollo/client';
import { Row } from '@tanstack/table-core';
import { Button, DropdownMenu, RecordTable, useToast } from 'erxes-ui';
import { ICustomer } from 'ui-modules';
import { useTranslation } from 'react-i18next';

type CustomerWithState = ICustomer & { state?: string };

export const CustomersChangeState = ({
  customerIds,
  rows,
}: {
  customerIds: string[];
  rows: Row<CustomerWithState>[];
}) => {
  const { t } = useTranslation('contact');
  const { changeCustomerState } = useChangeCustomerState();
  const { table } = RecordTable.useRecordTable();
  const { toast } = useToast();

  const LIFECYCLE_STATES = [
    { label: t('lifecycle-state-lead', 'Lead'), value: 'lead' },
    { label: t('lifecycle-state-customer', 'Customer'), value: 'customer' },
  ];

  const currentState =
    rows.length === 1 ? rows[0].original.state : undefined;

  const handleSelect = async (value: string) => {
    // Clear selection BEFORE the mutation so the cache update
    // doesn't try to reconcile stale row IDs that are about to be removed.
    table.setRowSelection({});

    await changeCustomerState(customerIds, value, {
      onError: (e: ApolloError) => {
        toast({
          title: t('error', 'Error'),
          description: e.message,
          variant: 'destructive',
        });
      },
      onCompleted: () => {
        const label =
          LIFECYCLE_STATES.find((s) => s.value === value)?.label ?? value;
        toast({
          title: t('success', 'Success'),
          variant: 'success',
          description: t('state-changed-success', { label }, 'State changed to "{{label}}" successfully'),
        });
      },
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button variant="secondary">
          <IconUserCheck />
          {t('change-state', 'Change State')}
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
            {state.label}
          </DropdownMenu.Item>
        ))}
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};
