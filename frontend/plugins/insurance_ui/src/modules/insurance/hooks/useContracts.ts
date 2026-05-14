import { useQuery, useMutation } from '@apollo/client';
import { useMultiQueryState } from 'erxes-ui';
import { queries, mutations } from '../graphql';
import { InsuranceContract } from '../types';

export function useContracts(vendorId?: string, customerId?: string) {
  const [filterParams] = useMultiQueryState<{
    searchValue: string;
    contractNumber: string;
    customerRegistration: string;
    plateNumber: string;
    paymentStatus: string;
    insuranceTypeId: string;
    startDate: string;
    endDate: string;
  }>([
    'searchValue',
    'contractNumber',
    'customerRegistration',
    'plateNumber',
    'paymentStatus',
    'insuranceTypeId',
    'startDate',
    'endDate',
  ]);

  /**
   * Cleans and trims string values, returns undefined for empty strings
   * @param v - The value to clean
   * @returns Trimmed string or undefined
   */
  const clean = (v: string | null | undefined) =>
    typeof v === 'string' && v.trim() ? v.trim() : undefined;

  const { data, loading, error, refetch } = useQuery(queries.CONTRACTS, {
    variables: {
      vendorId: clean(vendorId),
      customerId: clean(customerId),
      searchValue: clean(filterParams?.searchValue),
      contractNumber: clean(filterParams?.contractNumber),
      customerRegistration: clean(filterParams?.customerRegistration),
      plateNumber: clean(filterParams?.plateNumber),
      paymentStatus: clean(filterParams?.paymentStatus),
      insuranceTypeId: clean(filterParams?.insuranceTypeId),
      startDate: clean(filterParams?.startDate),
      endDate: clean(filterParams?.endDate),
    },
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
