import { gql } from '@apollo/client';
import { ProductCategoriesQueryResponse } from '@erxes/ui-products/src/types';
import { queries as brandQueries } from '@erxes/ui/src/brands/graphql';
import { BrandsQueryResponse } from '@erxes/ui/src/brands/types';
import { Alert, confirm } from '@erxes/ui/src/utils';
import React from 'react';
import List from '../../components/productCategory/CategoryList';
import { mutations, queries } from '../../graphql';
import {
  ProductCategoriesCountQueryResponse,
  ProductCategoryRemoveMutationResponse,
  ProductsQueryResponse,
} from '../../types';
import { useQuery, useMutation } from '@apollo/client';

type Props = { history: any; queryParams: any };

const ProductListContainer: React.FC<Props> = ({
  history,
  queryParams,
}: Props) => {
  const productCategoriesQuery = useQuery<ProductCategoriesQueryResponse>(
    gql(queries.productCategories),
    {
      variables: {
        status: queryParams.status,
        brand: queryParams.brand,
        parentId: queryParams.parentId,
      },
      fetchPolicy: 'network-only',
    },
  );

  const productCategoriesCountQuery =
    useQuery<ProductCategoriesCountQueryResponse>(
      gql(queries.productCategoriesCount),
    );
  const productsQuery = useQuery<ProductsQueryResponse>(gql(queries.products));
  const brandsQuery = useQuery<BrandsQueryResponse>(gql(brandQueries.brands));

  const [productCategoryRemove] =
    useMutation<ProductCategoryRemoveMutationResponse>(
      gql(mutations.productCategoryRemove),
      {
        refetchQueries: getRefetchQueries(),
      },
    );

  const remove = (productId) => {
    confirm().then(() => {
      productCategoryRemove({
        variables: { _id: productId },
      })
        .then(() => {
          productCategoriesQuery.refetch();
          productCategoriesCountQuery.refetch();
          productsQuery.refetch();

          Alert.success(
            `You successfully deleted a product & service category`,
          );
        })
        .catch((error) => {
          Alert.error(error.message);
        });
    });
  };

  const brands = (brandsQuery.data ? brandsQuery.data.brands : []) || [];
  const brandsLoading = (brandsQuery && brandsQuery.loading) || false;

  const productCategories =
    (productCategoriesQuery.data &&
      productCategoriesQuery.data.productCategories) ||
    [];

  const updatedProps = {
    history,
    queryParams,
    remove,
    productCategories,
    loading: productCategoriesQuery.loading,
    productCategoriesCount:
      (productCategoriesCountQuery.data &&
        productCategoriesCountQuery.data.productCategoriesTotalCount) ||
      0,
    brands,
    brandsLoading,
  };

  return <List {...updatedProps} />;
};

const getRefetchQueries = () => {
  return ['productCategories', 'productCategoriesTotalCount', 'products'];
};

export default ProductListContainer;
