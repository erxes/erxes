import { useQuery, useMutation } from '@apollo/client';
import { queries, mutations } from '../graphql';
import { VendorUser } from '../types';

export const useVendorUsers = (vendorId?: string) => {
  const { data, loading, error, refetch } = useQuery(queries.VENDOR_USERS, {
    variables: vendorId ? { vendorId } : undefined,
    fetchPolicy: 'network-only',
  });

  return {
    vendorUsers: (data?.vendorUsers || []) as VendorUser[],
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
    vendorUser: data?.vendorUser as VendorUser | undefined,
    loading,
    error,
  };
};

export const useCreateVendorUser = () => {
  const [createVendorUser, { loading, error }] = useMutation(
    mutations.CREATE_VENDOR_USER,
  );

  return {
    createVendorUser: async (variables: {
      name?: string;
      email: string;
      phone?: string;
      password: string;
      vendorId: string;
      role?: string;
    }) => {
      const result = await createVendorUser({ variables });
      return result.data?.createVendorUser as VendorUser;
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
    updateVendorUser: async (variables: {
      id: string;
      name?: string;
      email?: string;
      phone?: string;
      password?: string;
      role?: string;
    }) => {
      const result = await updateVendorUser({ variables });
      return result.data?.updateVendorUser as VendorUser;
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
