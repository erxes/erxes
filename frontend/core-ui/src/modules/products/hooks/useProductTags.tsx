import { useQuery } from '@apollo/client';

import { productsQueries } from '../graphql/ProductsQueries';

export const useProductTags = () => {
  const { data, loading, refetch } = useQuery(productsQueries.productTags, {
    variables: {
      perPage: 1000,
    },
  });

  return { tags: data?.tags, loading, refetch };
};
