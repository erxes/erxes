import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { Alert, confirm, withProps } from '@erxes/ui/src/utils';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import List from '../../components/productCategory/CategoryList';
import { mutations, queries } from '../../graphql';
import {
  ProductCategoriesCountQueryResponse,
  ProductCategoryRemoveMutationResponse,
  ProductsQueryResponse
} from '../../types';
import { ProductCategoriesQueryResponse } from '@erxes/ui-products/src/types';
type Props = { history: any; queryParams: any };

type FinalProps = {
  productCategoriesQuery: ProductCategoriesQueryResponse;
  productCategoriesCountQuery: ProductCategoriesCountQueryResponse;
  productsQuery: ProductsQueryResponse;
} & Props &
  ProductCategoryRemoveMutationResponse;
class ProductListContainer extends React.Component<FinalProps> {
  render() {
    const {
      productCategoriesQuery,
      productCategoriesCountQuery,
      productsQuery,
      productCategoryRemove
    } = this.props;

    const remove = productId => {
      confirm().then(() => {
        productCategoryRemove({
          variables: { _id: productId }
        })
          .then(() => {
            productCategoriesQuery.refetch();
            productCategoriesCountQuery.refetch();
            productsQuery.refetch();

            Alert.success(
              `You successfully deleted a product & service category`
            );
          })
          .catch(error => {
            Alert.error(error.message);
          });
      });
    };

    const productCategories = productCategoriesQuery.productCategories || [];

    const updatedProps = {
      ...this.props,
      remove,
      productCategories,
      loading: productCategoriesQuery.loading,
      productCategoriesCount:
        productCategoriesCountQuery.productCategoriesTotalCount || 0
    };

    return <List {...updatedProps} />;
  }
}

const getRefetchQueries = () => {
  return ['productCategories', 'productCategoriesTotalCount', 'products'];
};

const options = () => ({
  refetchQueries: getRefetchQueries()
});

export default withProps<Props>(
  compose(
    graphql<Props, ProductCategoriesQueryResponse, { parentId: string }>(
      gql(queries.productCategories),
      {
        name: 'productCategoriesQuery',
        options: ({ queryParams }) => ({
          variables: {
            status: queryParams.status,
            parentId: queryParams.parentId
          },
          refetchQueries: getRefetchQueries(),
          fetchPolicy: 'network-only'
        })
      }
    ),
    graphql<Props, ProductCategoriesCountQueryResponse>(
      gql(queries.productCategoriesCount),
      {
        name: 'productCategoriesCountQuery'
      }
    ),
    graphql<Props, ProductCategoryRemoveMutationResponse, { _id: string }>(
      gql(mutations.productCategoryRemove),
      {
        name: 'productCategoryRemove',
        options
      }
    ),
    graphql<Props, ProductsQueryResponse>(gql(queries.products), {
      name: 'productsQuery'
    })
  )(ProductListContainer)
);
