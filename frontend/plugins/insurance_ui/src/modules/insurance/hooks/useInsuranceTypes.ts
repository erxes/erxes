import { useQuery, useMutation, MutationHookOptions } from '@apollo/client';
import type {
  InsuranceCreateTypeMutation,
  InsuranceCreateTypeMutationVariables,
  InsuranceDeleteTypeMutation,
  InsuranceDeleteTypeMutationVariables,
  InsuranceUpdateTypeMutation,
  InsuranceUpdateTypeMutationVariables,
} from '~/gql/graphql';
import { queries, mutations } from '../graphql';

export function useInsuranceTypes() {
  const { data, loading, error, refetch } = useQuery(queries.INSURANCE_TYPES);

  return {
    insuranceTypes: data?.insuranceTypes || [],
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
    insuranceType: data?.insuranceType,
    loading,
    error,
  };
}

export function useCreateInsuranceType(
  options?: MutationHookOptions<
    InsuranceCreateTypeMutation,
    InsuranceCreateTypeMutationVariables
  >,
) {
  const [createInsuranceType, { loading, error }] = useMutation(
    mutations.CREATE_INSURANCE_TYPE,
    {
      refetchQueries: ['InsuranceTypes'],
      ...options,
    },
  );

  return { createInsuranceType, loading, error };
}

export function useUpdateInsuranceType(
  options?: MutationHookOptions<
    InsuranceUpdateTypeMutation,
    InsuranceUpdateTypeMutationVariables
  >,
) {
  const [updateInsuranceType, { loading, error }] = useMutation(
    mutations.UPDATE_INSURANCE_TYPE,
    {
      refetchQueries: ['InsuranceTypes', 'InsuranceType'],
      ...options,
    },
  );

  return { updateInsuranceType, loading, error };
}

export function useDeleteInsuranceType(
  options?: MutationHookOptions<
    InsuranceDeleteTypeMutation,
    InsuranceDeleteTypeMutationVariables
  >,
) {
  const [deleteInsuranceType, { loading, error }] = useMutation(
    mutations.DELETE_INSURANCE_TYPE,
    {
      refetchQueries: ['InsuranceTypes'],
      ...options,
    },
  );

  return { deleteInsuranceType, loading, error };
}
