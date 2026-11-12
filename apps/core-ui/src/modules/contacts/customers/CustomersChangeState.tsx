import type { Customer, CustomerState } from '@erxes/core-contract';
import { IconUserCheck } from '@tabler/icons-react';
import { useQueryClient } from '@tanstack/react-query';
import { Button, DropdownMenu, RecordTable, useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { api, messageOf } from '~/lib/api';
import { CUSTOMERS_KEY } from './useCustomers';

const LIFECYCLE_STATES: { labelKey: string; value: CustomerState }[] = [
  { labelKey: 'state-lead', value: 'lead' },
  { labelKey: 'state-customer', value: 'customer' },
];

/** Moves the selected customers to leads or back. */
export const CustomersChangeState = ({ customers }: { customers: Customer[] }) => {
  const { table } = RecordTable.useRecordTable();
  const client = useQueryClient();
  const { toast } = useToast();
  const { t } = useTranslation('contact', { keyPrefix: 'customer' });
  const currentState = customers.length === 1 ? customers[0]?.state : undefined;

  const handleSelect = async (value: CustomerState) => {
    // Clear the selection first: the rows leave this list.
    table.setRowSelection({});

    try {
      await Promise.all(
        customers.map((customer) => api.customers.update({ id: customer.id, state: value })),
      );

      const state = LIFECYCLE_STATES.find((item) => item.value === value);

      toast({
        title: t('success-title'),
        variant: 'success',
        description: t('state-changed', { label: state ? t(state.labelKey) : value }),
      });
    } catch (error) {
      toast({ title: t('error-title'), description: messageOf(error), variant: 'destructive' });
    } finally {
      void client.invalidateQueries({ queryKey: CUSTOMERS_KEY });
    }
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
            onSelect={() => void handleSelect(state.value)}
            className={currentState === state.value ? 'bg-primary/10 font-medium' : ''}
          >
            {t(state.labelKey)}
          </DropdownMenu.Item>
        ))}
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};
