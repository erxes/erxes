import { useQuery, useMutation, MutationHookOptions } from '@apollo/client';
import { queries, mutations } from '../graphql';
import { InsuranceVendor } from '../types';

export function useVendors() {
  const { data, loading, error, refetch } = useQuery(queries.VENDORS);

  return {
    vendors: (data?.vendors || []) as InsuranceVendor[],
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
    vendor: data?.vendor as InsuranceVendor | undefined,
    loading,
    error,
  };
}

export function useCreateVendor(
  options?: MutationHookOptions<
    { createVendor: InsuranceVendor },
    { name: string }
  >,
) {
  const [createVendor, { loading, error }] = useMutation<
    { createVendor: InsuranceVendor },
    { name: string }
  >(mutations.CREATE_VENDOR, {
    refetchQueries: ['Vendors'],
    ...options,
  });

  return { createVendor, loading, error };
}

export function useUpdateVendor(
  options?: MutationHookOptions<
    { updateVendor: InsuranceVendor },
    { id: string; name: string }
  >,
) {
  const [updateVendor, { loading, error }] = useMutation<
    { updateVendor: InsuranceVendor },
    { id: string; name: string }
  >(mutations.UPDATE_VENDOR, {
    refetchQueries: ['Vendors', 'Vendor'],
    ...options,
  });

  return { updateVendor, loading, error };
}

export function useAddProductToVendor(
  options?: MutationHookOptions<
    { addProductToVendor: InsuranceVendor },
    { vendorId: string; productId: string; pricingOverride?: any }
  >,
) {
  const [addProductToVendor, { loading, error }] = useMutation<
    { addProductToVendor: InsuranceVendor },
    { vendorId: string; productId: string; pricingOverride?: any }
  >(mutations.ADD_PRODUCT_TO_VENDOR, {
    refetchQueries: ['Vendors', 'Vendor'],
    ...options,
  });

  return { addProductToVendor, loading, error };
}

export function useRemoveProductFromVendor(
  options?: MutationHookOptions<
    { removeProductFromVendor: InsuranceVendor },
    { vendorId: string; productId: string }
  >,
) {
  const [removeProductFromVendor, { loading, error }] = useMutation<
    { removeProductFromVendor: InsuranceVendor },
    { vendorId: string; productId: string }
  >(mutations.REMOVE_PRODUCT_FROM_VENDOR, {
    refetchQueries: ['Vendors', 'Vendor'],
    ...options,
  });

  return { removeProductFromVendor, loading, error };
}
