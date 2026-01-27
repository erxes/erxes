import { useQuery, useMutation } from '@apollo/client';
import { queries, mutations } from '../graphql';
import { InsuranceProduct, CoveredRiskInput } from '../types';

export function useInsuranceProducts() {
  const { data, loading, error, refetch } = useQuery(
    queries.INSURANCE_PRODUCTS,
  );

  return {
    insuranceProducts: (data?.insuranceProducts || []) as InsuranceProduct[],
    loading,
    error,
    refetch,
  };
}

export function useInsuranceProduct(id: string) {
  const { data, loading, error } = useQuery(queries.INSURANCE_PRODUCT, {
    variables: { id },
    skip: !id,
  });

  return {
    insuranceProduct: data?.insuranceProduct as InsuranceProduct | undefined,
    loading,
    error,
  };
}

export function useProductsByType(typeId: string) {
  const { data, loading, error } = useQuery(queries.PRODUCTS_BY_TYPE, {
    variables: { typeId },
    skip: !typeId,
  });

  return {
    products: (data?.productsByType || []) as InsuranceProduct[],
    loading,
    error,
  };
}

export function useCreateInsuranceProduct() {
  const [createInsuranceProduct, { loading, error }] = useMutation(
    mutations.CREATE_INSURANCE_PRODUCT,
    {
      refetchQueries: ['InsuranceProducts'],
    },
  );

  return { createInsuranceProduct, loading, error };
}

export function useUpdateInsuranceProduct() {
  const [updateInsuranceProduct, { loading, error }] = useMutation(
    mutations.UPDATE_INSURANCE_PRODUCT,
    {
      refetchQueries: ['InsuranceProducts', 'InsuranceProduct'],
    },
  );

  return { updateInsuranceProduct, loading, error };
}

export function useDeleteInsuranceProduct() {
  const [deleteInsuranceProduct, { loading, error }] = useMutation(
    mutations.DELETE_INSURANCE_PRODUCT,
    {
      refetchQueries: ['InsuranceProducts'],
    },
  );

  return { deleteInsuranceProduct, loading, error };
}
