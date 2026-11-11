import type { Customer, CustomerInput, CustomerState } from '@erxes/core-contract';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMultiQueryState, useToast } from 'erxes-ui';
import { api, messageOf } from '~/lib/api';
import { patchCachedRecord, removeCachedRecords, useCursorList } from '~/lib/cursorList';

export const CUSTOMERS_KEY = ['customers'];

/** RecordTable remembers the scroll position per list under this key. */
export const customersSessionKey = (state: CustomerState) => `core_${state}s_cursor`;

/** The query parameter that opens a customer (`new` for a new one) in the sheet. */
export const CUSTOMER_SHEET_PARAM = 'customerId';

export const useCustomers = (state: CustomerState) => {
  const [{ searchValue, tagId }] = useMultiQueryState<{ searchValue: string; tagId: string }>([
    'searchValue',
    'tagId',
  ]);
  const filters = { state, search: searchValue || undefined, tagIds: tagId || undefined };

  return useCursorList<Customer>({
    queryKey: [...CUSTOMERS_KEY, 'list', filters],
    sessionKey: customersSessionKey(state),
    fetchPage: (params) => api.customers.list({ ...params, ...filters }),
  });
};

export const useCustomer = (id: string | null) =>
  useQuery({
    queryKey: [...CUSTOMERS_KEY, 'detail', id],
    queryFn: () => api.customers.get({ id: id! }),
    enabled: !!id,
  });

export const useCustomerEdit = () => {
  const client = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, ...body }: CustomerInput & { id: string }) =>
      api.customers.update({ id, ...body }),
    onSuccess: (customer, input) => {
      patchCachedRecord(client, CUSTOMERS_KEY, customer);
      client.setQueryData([...CUSTOMERS_KEY, 'detail', customer.id], customer);

      // Lead ↔ customer moves it to the other list.
      if (input.state) {
        void client.invalidateQueries({ queryKey: [...CUSTOMERS_KEY, 'list'] });
      }
    },
    onError: (error) =>
      toast({ variant: 'destructive', title: 'Could not save the customer', description: messageOf(error) }),
  });
};

export const useCustomerCreate = () => {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (body: CustomerInput) => api.customers.create(body),
    onSuccess: () => client.invalidateQueries({ queryKey: [...CUSTOMERS_KEY, 'list'] }),
  });
};

export const useCustomersRemove = () => {
  const client = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (ids: string[]) => api.customers.remove({ ids }),
    onSuccess: ({ removed }, ids) => {
      removeCachedRecords(client, CUSTOMERS_KEY, ids);
      void client.invalidateQueries({ queryKey: [...CUSTOMERS_KEY, 'list'] });
      toast({ variant: 'success', title: removed === 1 ? 'Customer deleted' : `${removed} customers deleted` });
    },
    onError: (error) =>
      toast({ variant: 'destructive', title: 'Could not delete', description: messageOf(error) }),
  });
};

export const customerName = (customer: Pick<Customer, 'firstName' | 'middleName' | 'lastName'>) =>
  [customer.firstName, customer.middleName, customer.lastName].filter(Boolean).join(' ');

export const useCustomersTag = () => {
  const client = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (input: { ids: string[]; add: string[]; remove: string[] }) =>
      api.customers.tag(input),
    onSuccess: () => client.invalidateQueries({ queryKey: CUSTOMERS_KEY }),
    onError: (error) => toast({ variant: 'destructive', title: 'Could not tag', description: messageOf(error) }),
  });
};

export const useCustomersMerge = () => {
  const client = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (input: { ids: string[]; keepId: string }) => api.customers.merge(input),
    onSuccess: (customer, input) => {
      removeCachedRecords(
        client,
        CUSTOMERS_KEY,
        input.ids.filter((id) => id !== customer.id),
      );
      patchCachedRecord(client, CUSTOMERS_KEY, customer);
      void client.invalidateQueries({ queryKey: CUSTOMERS_KEY });
      toast({ variant: 'success', title: 'Customers merged' });
    },
    onError: (error) => toast({ variant: 'destructive', title: 'Could not merge', description: messageOf(error) }),
  });
};

/** The companies a customer belongs to. */
export const useCustomerCompanies = (customerId: string | null) =>
  useQuery({
    queryKey: [...CUSTOMERS_KEY, 'companies', customerId],
    queryFn: () => api.customers.companies({ id: customerId! }),
    enabled: !!customerId,
  });

/** Links or unlinks a customer and a company (refreshes both sides). */
export const useCustomerCompanyLink = () => {
  const client = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ customerId, companyId, linked }: { customerId: string; companyId: string; linked: boolean }) =>
      linked
        ? api.customers.linkCompany({ id: customerId, companyId })
        : api.customers.unlinkCompany({ id: customerId, companyId }),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: [...CUSTOMERS_KEY, 'companies'] });
      void client.invalidateQueries({ queryKey: [...CUSTOMERS_KEY, 'list'] });
      void client.invalidateQueries({ queryKey: ['companies'] });
    },
    onError: (error) => toast({ variant: 'destructive', title: 'Could not update', description: messageOf(error) }),
  });
};
