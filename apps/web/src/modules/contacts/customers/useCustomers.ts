import { z } from 'zod';
import type { Customer, CustomerState } from '@erxes/core-contract';
import { skipToken, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useQueryState, useToast } from 'erxes-ui';
import { messageOf, orpc } from '~/lib/api';
import { patchCachedRecord, removeCachedRecords, useCursorList } from '~/lib/cursorList';
import { useAdvancedFilterParam } from '~/modules/views/useViews';

/** RecordTable remembers the scroll position per list under this key. */
export const customersSessionKey = (state: CustomerState) => `core_${state}s_cursor`;

/** The list filters, read from the URL: the search and the filter (views save both). */
export const useCustomersFilters = (state: CustomerState) => {
  const [searchValue] = useQueryState('searchValue', z.string());

  return { state, filter: useAdvancedFilterParam(), search: searchValue || undefined };
};

export const useCustomers = (state: CustomerState) => {
  const filters = useCustomersFilters(state);

  return useCursorList<Customer>({
    sessionKey: customersSessionKey(state),
    filters,
    options: (paging) =>
      orpc.customers.list.infiniteOptions({
        input: (page) => ({ ...page, ...filters }),
        ...paging,
      }),
  });
};

export const useCustomer = (id: string | null) =>
  useQuery(orpc.customers.get.queryOptions({ input: id ? { id } : skipToken }));

export const useCustomerEdit = () => {
  const client = useQueryClient();
  const { toast } = useToast();

  return useMutation(
    orpc.customers.update.mutationOptions({
      onSuccess: (customer, input) => {
        patchCachedRecord(client, orpc.customers.list.key(), customer);
        client.setQueryData(orpc.customers.get.queryKey({ input: { id: customer.id } }), customer);

        // Lead ↔ customer moves it to the other list.
        if (input.state) {
          void client.invalidateQueries({ queryKey: orpc.customers.list.key() });
        }
      },
      onError: (error) =>
        toast({
          variant: 'destructive',
          title: 'Could not save the customer',
          description: messageOf(error),
        }),
    }),
  );
};

/** Callers show the failure next to the field it is about (`CUSTOMER_EXISTS`). */
export const useCustomerCreate = () => {
  const client = useQueryClient();

  return useMutation(
    orpc.customers.create.mutationOptions({
      onSuccess: () => client.invalidateQueries({ queryKey: orpc.customers.list.key() }),
    }),
  );
};

export const useCustomersRemove = () => {
  const client = useQueryClient();
  const { toast } = useToast();

  return useMutation(
    orpc.customers.remove.mutationOptions({
      onSuccess: ({ removed }, { ids }) => {
        removeCachedRecords(client, orpc.customers.list.key(), ids);
        void client.invalidateQueries({ queryKey: orpc.customers.list.key() });
        toast({
          variant: 'success',
          title: removed === 1 ? 'Customer deleted' : `${removed} customers deleted`,
        });
      },
      onError: (error) =>
        toast({ variant: 'destructive', title: 'Could not delete', description: messageOf(error) }),
    }),
  );
};

export const customerName = (customer: Pick<Customer, 'firstName' | 'middleName' | 'lastName'>) =>
  [customer.firstName, customer.middleName, customer.lastName].filter(Boolean).join(' ');

export const useCustomersTag = () => {
  const client = useQueryClient();
  const { toast } = useToast();

  return useMutation(
    orpc.customers.tag.mutationOptions({
      onSuccess: () => client.invalidateQueries({ queryKey: orpc.customers.key() }),
      onError: (error) =>
        toast({ variant: 'destructive', title: 'Could not tag', description: messageOf(error) }),
    }),
  );
};

export const useCustomersMerge = () => {
  const client = useQueryClient();
  const { toast } = useToast();

  return useMutation(
    orpc.customers.merge.mutationOptions({
      onSuccess: (customer, input) => {
        removeCachedRecords(
          client,
          orpc.customers.list.key(),
          input.ids.filter((id) => id !== customer.id),
        );
        patchCachedRecord(client, orpc.customers.list.key(), customer);
        void client.invalidateQueries({ queryKey: orpc.customers.key() });
        toast({ variant: 'success', title: 'Customers merged' });
      },
      onError: (error) =>
        toast({ variant: 'destructive', title: 'Could not merge', description: messageOf(error) }),
    }),
  );
};
