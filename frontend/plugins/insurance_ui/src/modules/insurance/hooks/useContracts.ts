import { useQuery, useMutation } from '@apollo/client';
import { queries, mutations } from '../graphql';
import { InsuranceContract } from '../types';

export function useContracts(vendorId?: string, customerId?: string) {
  const { data, loading, error, refetch } = useQuery(queries.CONTRACTS, {
    variables: { vendorId, customerId },
  });

  return {
    contracts: (data?.contracts || []) as InsuranceContract[],
    loading,
    error,
    refetch,
  };
}

export function useContract(id: string) {
  const { data, loading, error } = useQuery(queries.CONTRACT, {
    variables: { id },
    skip: !id,
  });

  return {
    contract: data?.contract as InsuranceContract | undefined,
    loading,
    error,
  };
}

export function useVendorContracts() {
  const { data, loading, error, refetch } = useQuery(queries.VENDOR_CONTRACTS);

  return {
    contracts: (data?.vendorContracts || []) as InsuranceContract[],
    loading,
    error,
    refetch,
  };
}

export function useCreateInsuranceContract() {
  const [createInsuranceContract, { loading, error }] = useMutation(
    mutations.CREATE_INSURANCE_CONTRACT,
    {
      refetchQueries: ['Contracts', 'VendorContracts'],
    },
  );

  return { createInsuranceContract, loading, error };
}
