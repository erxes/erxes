import { useQuery, useMutation, MutationHookOptions } from '@apollo/client';
import type {
  InsuranceCreateRiskTypeMutation,
  InsuranceCreateRiskTypeMutationVariables,
  InsuranceDeleteRiskTypeMutation,
  InsuranceDeleteRiskTypeMutationVariables,
  InsuranceUpdateRiskTypeMutation,
  InsuranceUpdateRiskTypeMutationVariables,
} from '~/gql/graphql';
import { queries, mutations } from '../graphql';

export function useRiskTypes() {
  const { data, loading, error, refetch } = useQuery(queries.RISK_TYPES);

  return {
    riskTypes: data?.riskTypes || [],
    loading,
    error,
    refetch,
  };
}

export function useRiskType(id: string) {
  const { data, loading, error } = useQuery(queries.RISK_TYPE, {
    variables: { id },
    skip: !id,
  });

  return {
    riskType: data?.riskType,
    loading,
    error,
  };
}

export function useCreateRiskType(
  options?: MutationHookOptions<
    InsuranceCreateRiskTypeMutation,
    InsuranceCreateRiskTypeMutationVariables
  >,
) {
  const [createRiskType, { loading, error }] = useMutation(
    mutations.CREATE_RISK_TYPE,
    {
      refetchQueries: ['InsuranceRiskTypes'],
      ...options,
    },
  );

  return { createRiskType, loading, error };
}

export function useUpdateRiskType(
  options?: MutationHookOptions<
    InsuranceUpdateRiskTypeMutation,
    InsuranceUpdateRiskTypeMutationVariables
  >,
) {
  const [updateRiskType, { loading, error }] = useMutation(
    mutations.UPDATE_RISK_TYPE,
    {
      refetchQueries: ['InsuranceRiskTypes', 'InsuranceRiskType'],
      ...options,
    },
  );

  return { updateRiskType, loading, error };
}

export function useDeleteRiskType(
  options?: MutationHookOptions<
    InsuranceDeleteRiskTypeMutation,
    InsuranceDeleteRiskTypeMutationVariables
  >,
) {
  const [deleteRiskType, { loading, error }] = useMutation(
    mutations.DELETE_RISK_TYPE,
    {
      refetchQueries: ['InsuranceRiskTypes'],
      ...options,
    },
  );

  return { deleteRiskType, loading, error };
}
