import { useQuery, useMutation, MutationHookOptions } from '@apollo/client';
import type {
  InsuranceAddProductToVendorMutation,
  InsuranceAddProductToVendorMutationVariables,
  InsuranceCreateVendorMutation,
  InsuranceCreateVendorMutationVariables,
  InsuranceRemoveProductFromVendorMutation,
  InsuranceRemoveProductFromVendorMutationVariables,
  InsuranceUpdateVendorMutation,
  InsuranceUpdateVendorMutationVariables,
} from '~/gql/graphql';
import { queries, mutations } from '../graphql';

export function useVendors() {
  const { data, loading, error, refetch } = useQuery(queries.VENDORS);

  return {
    vendors: data?.vendors || [],
    loading,
    error,
    refetch,
  };
}

export function useVendor(id: string) {
  const { data, loading, error } = useQuery(queries.VENDOR, {
    variables: { id },
    skip: !id,
  });

  return {
    vendor: data?.vendor,
    loading,
    error,
  };
}

export function useCreateVendor(
  options?: MutationHookOptions<
    InsuranceCreateVendorMutation,
    InsuranceCreateVendorMutationVariables
  >,
) {
  const [createVendor, { loading, error }] = useMutation(
    mutations.CREATE_VENDOR,
    {
      refetchQueries: ['InsuranceVendors'],
      ...options,
    },
  );

  return { createVendor, loading, error };
}

export function useUpdateVendor(
  options?: MutationHookOptions<
    InsuranceUpdateVendorMutation,
    InsuranceUpdateVendorMutationVariables
  >,
) {
  const [updateVendor, { loading, error }] = useMutation(
    mutations.UPDATE_VENDOR,
    {
      refetchQueries: ['InsuranceVendors', 'InsuranceVendor'],
      ...options,
    },
  );

  return { updateVendor, loading, error };
}

export function useAddProductToVendor(
  options?: MutationHookOptions<
    InsuranceAddProductToVendorMutation,
    InsuranceAddProductToVendorMutationVariables
  >,
) {
  const [addProductToVendor, { loading, error }] = useMutation(
    mutations.ADD_PRODUCT_TO_VENDOR,
    {
      refetchQueries: ['InsuranceVendors', 'InsuranceVendor'],
      ...options,
    },
  );

  return { addProductToVendor, loading, error };
}

export function useRemoveProductFromVendor(
  options?: MutationHookOptions<
    InsuranceRemoveProductFromVendorMutation,
    InsuranceRemoveProductFromVendorMutationVariables
  >,
) {
  const [removeProductFromVendor, { loading, error }] = useMutation(
    mutations.REMOVE_PRODUCT_FROM_VENDOR,
    {
      refetchQueries: ['InsuranceVendors', 'InsuranceVendor'],
      ...options,
    },
  );

  return { removeProductFromVendor, loading, error };
}
