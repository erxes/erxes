import type { Customer, CustomerState } from '@erxes/core-contract';
import { IconUserCheck } from '@tabler/icons-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, DropdownMenu, RecordTable, useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { messageOf, orpc } from '~/lib/api';

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

  const change = useMutation({
    mutationFn: (state: CustomerState) =>
      Promise.all(
        customers.map((customer) => orpc.customers.update.call({ id: customer.id, state })),
      ),
    onSuccess: (_updated, value) => {
      const state = LIFECYCLE_STATES.find((item) => item.value === value);

      toast({
        title: t('success-title'),
        variant: 'success',
        description: t('state-changed', { label: state ? t(state.labelKey) : value }),
      });
    },
    onError: (error) =>
      toast({ title: t('error-title'), description: messageOf(error), variant: 'destructive' }),
    onSettled: () => client.invalidateQueries({ queryKey: orpc.customers.key() }),
  });

  const handleSelect = (value: CustomerState) => {
    // Clear the selection first: the rows leave this list.
    table.setRowSelection({});
    change.mutate(value);
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
            disabled={change.isPending}
            onSelect={() => handleSelect(state.value)}
            className={currentState === state.value ? 'bg-primary/10 font-medium' : ''}
          >
            {t(state.labelKey)}
          </DropdownMenu.Item>
        ))}
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};
