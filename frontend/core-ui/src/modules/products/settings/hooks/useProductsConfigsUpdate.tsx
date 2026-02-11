import { useMutation } from '@apollo/client';
import { PRODUCTS_CONFIGS_UPDATE } from '../graphql/mutations/productsConfigs';
import { PRODUCTS_CONFIGS } from '../graphql/queries/productsConfigs';

export const useProductsConfigsUpdate = () => {
  const [productsConfigsUpdate, { loading }] = useMutation(
    PRODUCTS_CONFIGS_UPDATE,
    {
      refetchQueries: [{ query: PRODUCTS_CONFIGS }],
    },
  );

  return { productsConfigsUpdate, loading };
};
