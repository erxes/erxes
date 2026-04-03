import { useQuery, useMutation } from '@apollo/client';
import { queries, mutations } from '../graphql';
import { InsuranceCustomer } from '../types';

export function useCustomers() {
  const { data, loading, error, refetch } = useQuery(
    queries.INSURANCE_CUSTOMERS,
  );

  return {
    customers: (data?.insuranceCustomers || []) as InsuranceCustomer[],
    loading,
    error,
    refetch,
  };
}

export function useCustomer(id: string) {
  const { data, loading, error } = useQuery(queries.INSURANCE_CUSTOMER, {
    variables: { id },
    skip: !id,
  });

  return {
    customer: data?.insuranceCustomer as InsuranceCustomer | undefined,
    loading,
    error,
  };
}

export function useCreateCustomer() {
  const [createCustomer, { loading, error }] = useMutation(
    mutations.CREATE_CUSTOMER,
    {
      refetchQueries: ['InsuranceCustomers'],
    },
  );

  return { createCustomer, loading, error };
}

export function useUpdateCustomer() {
  const [updateCustomer, { loading, error }] = useMutation(
    mutations.UPDATE_CUSTOMER,
    {
      refetchQueries: ['InsuranceCustomers', 'InsuranceCustomer'],
    },
  );

  return { updateCustomer, loading, error };
}

export function useDeleteCustomer() {
  const [deleteCustomer, { loading, error }] = useMutation(
    mutations.DELETE_CUSTOMER,
    {
      refetchQueries: ['InsuranceCustomers'],
    },
  );

  return { deleteCustomer, loading, error };
}
