import type { ApolloClient, Reference, StoreObject } from '@apollo/client';
import { GET_DEAL_DETAIL } from '@/deals/graphql/queries/DealsQueries';
import type { IDeal } from '@/deals/types/deals';
import type { IProductData } from 'ui-modules';

export const updateDealProductsCache = (
  client: ApolloClient<object>,
  dealId: string | null,
  productsData: IProductData[],
) => {
  if (!dealId) return;

  client.cache.modify({
    id: client.cache.identify({
      _id: dealId,
      __typename: 'Deal',
    }),
    fields: {
      productsData() {
        return productsData;
      },
      products(
        existingProducts: readonly (Reference | StoreObject)[] | undefined,
        { readField },
      ) {
        const cachedProducts: (Reference | StoreObject)[] = Array.isArray(
          existingProducts,
        )
          ? [...existingProducts]
          : [];
        const existingProductsById = new Map<string, Reference | StoreObject>();

        cachedProducts.forEach((product) => {
          const productId = readField<string>('_id', product);
          if (productId) {
            existingProductsById.set(productId, product);
          }
        });

        return productsData.flatMap((productData) => {
          const productId = productData.productId;
          if (!productId) return [];

          if (productData.product?._id) {
            return [{ __typename: 'Product', ...productData.product }];
          }

          return [
            existingProductsById.get(productId) || {
              __typename: 'Product',
              _id: productId,
            },
          ];
        });
      },
    },
  });

  client.cache.updateQuery<{ dealDetail: IDeal }>(
    {
      query: GET_DEAL_DETAIL,
      variables: { _id: dealId },
    },
    (current) => {
      if (!current?.dealDetail) {
        return current;
      }

      return {
        ...current,
        dealDetail: {
          ...current.dealDetail,
          productsData,
        },
      };
    },
  );
};
