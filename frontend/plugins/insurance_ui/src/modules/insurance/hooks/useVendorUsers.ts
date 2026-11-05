import { useQuery, useMutation } from '@apollo/client';
import { queries, mutations } from '../graphql';
import type {
  InsuranceCreateVendorUserMutationVariables,
  InsuranceUpdateVendorUserMutationVariables,
} from '~/gql/graphql';

export const useVendorUsers = (vendorId?: string) => {
  const { data, loading, error, refetch } = useQuery(queries.VENDOR_USERS, {
    variables: vendorId ? { vendorId } : undefined,
    fetchPolicy: 'network-only',
  });

  return {
    vendorUsers: data?.vendorUsers || [],
    loading,
    error,
    refetch,
  };
};

export const useVendorUser = (id: string) => {
  const { data, loading, error } = useQuery(queries.VENDOR_USER, {
    variables: { id },
    skip: !id,
  });

  return {
    vendorUser: data?.vendorUser,
    loading,
    error,
  };
};

export const useCreateVendorUser = () => {
  const [createVendorUser, { loading, error }] = useMutation(
    mutations.CREATE_VENDOR_USER,
  );

  return {
    createVendorUser: async (
      variables: InsuranceCreateVendorUserMutationVariables,
    ) => {
      const result = await createVendorUser({ variables });
      return result.data?.createVendorUser;
    },
    loading,
    error,
  };
};

export const useUpdateVendorUser = () => {
  const [updateVendorUser, { loading, error }] = useMutation(
    mutations.UPDATE_VENDOR_USER,
  );

  return {
    updateVendorUser: async (
      variables: InsuranceUpdateVendorUserMutationVariables,
    ) => {
      const result = await updateVendorUser({ variables });
      return result.data?.updateVendorUser;
    },
    loading,
    error,
  };
};

export const useDeleteVendorUser = () => {
  const [deleteVendorUser, { loading, error }] = useMutation(
    mutations.DELETE_VENDOR_USER,
  );

  return {
    deleteVendorUser: async (id: string) => {
      await deleteVendorUser({ variables: { id } });
    },
    loading,
    error,
  };
};
