import { useQuery, useMutation, useLazyQuery } from '@apollo/client';
import {
  INSURANCE_REGIONS,
  INSURANCE_REGION,
  PRODUCTS_BY_COUNTRY,
  CALCULATE_TRAVEL_PRICE,
} from '../graphql/queries';
import {
  CREATE_INSURANCE_REGION,
  UPDATE_INSURANCE_REGION,
  DELETE_INSURANCE_REGION,
  ADD_COUNTRY_TO_REGION,
  REMOVE_COUNTRY_FROM_REGION,
} from '../graphql/mutations';

export const useRegions = () => {
  const { data, loading, error, refetch } = useQuery(INSURANCE_REGIONS);
  return {
    regions: data?.insuranceRegions || [],
    loading,
    error,
    refetch,
  };
};

export const useRegion = (id: string) => {
  const { data, loading, error } = useQuery(INSURANCE_REGION, {
    variables: { id },
    skip: !id,
  });
  return { region: data?.insuranceRegion, loading, error };
};

export const useProductsByCountry = () => {
  const [fetchProducts, { data, loading, error }] =
    useLazyQuery(PRODUCTS_BY_COUNTRY);
  return {
    fetchProducts: (country: string) =>
      fetchProducts({ variables: { country } }),
    products: data?.productsByCountry || [],
    loading,
    error,
  };
};

export const useCalculateTravelPrice = () => {
  const [calculate, { data, loading, error }] = useLazyQuery(
    CALCULATE_TRAVEL_PRICE,
  );
  return {
    calculate: (variables: {
      productId: string;
      vendorId: string;
      startDate: string;
      endDate: string;
      travelerCount: number;
    }) => calculate({ variables, fetchPolicy: 'network-only' }),
    priceResult: data?.calculateTravelPrice,
    loading,
    error,
  };
};

export const useCreateRegion = () => {
  const [createRegion, { loading }] = useMutation(CREATE_INSURANCE_REGION, {
    refetchQueries: [{ query: INSURANCE_REGIONS }],
  });
  return { createRegion, loading };
};

export const useUpdateRegion = () => {
  const [updateRegion, { loading }] = useMutation(UPDATE_INSURANCE_REGION, {
    refetchQueries: [{ query: INSURANCE_REGIONS }],
  });
  return { updateRegion, loading };
};

export const useDeleteRegion = () => {
  const [deleteRegion, { loading }] = useMutation(DELETE_INSURANCE_REGION, {
    refetchQueries: [{ query: INSURANCE_REGIONS }],
  });
  return { deleteRegion, loading };
};

export const useAddCountryToRegion = () => {
  const [addCountry, { loading }] = useMutation(ADD_COUNTRY_TO_REGION, {
    refetchQueries: [{ query: INSURANCE_REGIONS }],
  });
  return { addCountry, loading };
};

export const useRemoveCountryFromRegion = () => {
  const [removeCountry, { loading }] = useMutation(REMOVE_COUNTRY_FROM_REGION, {
    refetchQueries: [{ query: INSURANCE_REGIONS }],
  });
  return { removeCountry, loading };
};
