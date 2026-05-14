import { useQuery, useMutation, MutationHookOptions } from '@apollo/client';
import { queries, mutations } from '../graphql';
import { RiskType } from '../types';

export function useRiskTypes() {
  const { data, loading, error, refetch } = useQuery(queries.RISK_TYPES);

  return {
    riskTypes: (data?.riskTypes || []) as RiskType[],
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
    riskType: data?.riskType as RiskType | undefined,
    loading,
    error,
  };
}

export function useCreateRiskType(
  options?: MutationHookOptions<
    { createRiskType: RiskType },
    { name: string; description?: string }
  >,
) {
  const [createRiskType, { loading, error }] = useMutation<
    { createRiskType: RiskType },
    { name: string; description?: string }
  >(mutations.CREATE_RISK_TYPE, {
    refetchQueries: ['RiskTypes'],
    ...options,
  });

  return { createRiskType, loading, error };
}

export function useUpdateRiskType(
  options?: MutationHookOptions<
    { updateRiskType: RiskType },
    { id: string; name?: string; description?: string }
  >,
) {
  const [updateRiskType, { loading, error }] = useMutation<
    { updateRiskType: RiskType },
    { id: string; name?: string; description?: string }
  >(mutations.UPDATE_RISK_TYPE, {
    refetchQueries: ['RiskTypes', 'RiskType'],
    ...options,
  });

  return { updateRiskType, loading, error };
}

export function useDeleteRiskType(
  options?: MutationHookOptions<{ deleteRiskType: boolean }, { id: string }>,
) {
  const [deleteRiskType, { loading, error }] = useMutation<
    { deleteRiskType: boolean },
    { id: string }
  >(mutations.DELETE_RISK_TYPE, {
    refetchQueries: ['RiskTypes'],
    ...options,
  });

  return { deleteRiskType, loading, error };
}
