import type { CustomerState, CustomerWithValues, DataExtensionValues } from '@erxes/core-contract';
import { skipToken, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useListFilterParams, useToast } from 'erxes-ui';
import { messageOf, orpc } from '@erxes/core-contract/client';
import {
  type CursorCache,
  patchCachedRecord,
  recordInPages,
  removeCachedRecords,
  useCursorList,
} from '~/lib/cursorList';

/** RecordTable remembers the scroll position per list under this key. */
const customersSessionKey = (state: CustomerState) => `core_${state}s_cursor`;

/** The list filters, read from the URL: the search and the filter (views save both). */
export const useCustomersFilters = (state: CustomerState) => ({
  state,
  ...useListFilterParams(),
});

export const useCustomers = (state: CustomerState) => {
  const filters = useCustomersFilters(state);

  return useCursorList<CustomerWithValues>({
    sessionKey: customersSessionKey(state),
    filters,
    options: (paging) =>
      orpc.customers.list.infiniteOptions({
        input: (page) => ({ ...page, ...filters }),
        ...paging,
      }),
  });
};

/** A customer; a row a list already loaded shows at once, until the customer itself arrives. */
export const useCustomer = (id: string | null) => {
  const client = useQueryClient();

  return useQuery(
    orpc.customers.get.queryOptions({
      input: id ? { id } : skipToken,
      placeholderData: () =>
        id
          ? recordInPages(
              client.getQueriesData<CursorCache<CustomerWithValues>>({
                queryKey: orpc.customers.list.key(),
              }),
              id,
            )
          : undefined,
    }),
  );
};

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

/** Saves a customer's Data Extensions values; the caller shows a failure on its fields. */
export const useCustomerValuesSave = (id: string) => {
  const client = useQueryClient();

  return async (values: DataExtensionValues) => {
    const customer = await orpc.customers.update.call({ id, values });

    patchCachedRecord(client, orpc.customers.list.key(), customer);
    client.setQueryData(orpc.customers.get.queryKey({ input: { id } }), customer);
  };
};

/** Callers show the failure next to the field it is about (`TAKEN`). */
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
