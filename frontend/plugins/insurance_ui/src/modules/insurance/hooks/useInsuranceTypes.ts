import { useQuery, useMutation, MutationHookOptions } from '@apollo/client';
import { queries, mutations } from '../graphql';
import { InsuranceType, AttributeInput } from '../types';

export function useInsuranceTypes() {
  const { data, loading, error, refetch } = useQuery(queries.INSURANCE_TYPES);

  return {
    insuranceTypes: (data?.insuranceTypes || []) as InsuranceType[],
    loading,
    error,
    refetch,
  };
}

export function useInsuranceType(id: string) {
  const { data, loading, error } = useQuery(queries.INSURANCE_TYPE, {
    variables: { id },
    skip: !id,
  });

  return {
    insuranceType: data?.insuranceType as InsuranceType | undefined,
    loading,
    error,
  };
}

export function useCreateInsuranceType(
  options?: MutationHookOptions<
    { createInsuranceType: InsuranceType },
    { name: string; attributes?: AttributeInput[] }
  >,
) {
  const [createInsuranceType, { loading, error }] = useMutation<
    { createInsuranceType: InsuranceType },
    { name: string; attributes?: AttributeInput[] }
  >(mutations.CREATE_INSURANCE_TYPE, {
    refetchQueries: ['InsuranceTypes'],
    ...options,
  });

  return { createInsuranceType, loading, error };
}

export function useUpdateInsuranceType(
  options?: MutationHookOptions<
    { updateInsuranceType: InsuranceType },
    { id: string; name?: string; attributes?: AttributeInput[] }
  >,
) {
  const [updateInsuranceType, { loading, error }] = useMutation<
    { updateInsuranceType: InsuranceType },
    { id: string; name?: string; attributes?: AttributeInput[] }
  >(mutations.UPDATE_INSURANCE_TYPE, {
    refetchQueries: ['InsuranceTypes', 'InsuranceType'],
    ...options,
  });

  return { updateInsuranceType, loading, error };
}

export function useDeleteInsuranceType(
  options?: MutationHookOptions<
    { deleteInsuranceType: boolean },
    { id: string }
  >,
) {
  const [deleteInsuranceType, { loading, error }] = useMutation<
    { deleteInsuranceType: boolean },
    { id: string }
  >(mutations.DELETE_INSURANCE_TYPE, {
    refetchQueries: ['InsuranceTypes'],
    ...options,
  });

  return { deleteInsuranceType, loading, error };
}
