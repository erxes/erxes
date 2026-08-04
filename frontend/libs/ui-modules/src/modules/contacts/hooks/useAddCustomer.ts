import { MutationHookOptions, useMutation } from '@apollo/client';
import { CUSTOMERS_ADD } from '../graphql/mutations/addCustomers';

export function useAddCustomer(
  options?: MutationHookOptions<{ customersAdd: { _id: string } }>,
) {
  const [customersAdd, { loading, error }] = useMutation<{
    customersAdd: { _id: string };
  }>(CUSTOMERS_ADD, options);

  return { customersAdd, loading, error };
}
