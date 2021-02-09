import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { Alert, confirm, withProps } from 'modules/common/utils';
import React from 'react';
import { graphql } from 'react-apollo';
import List from '../../components/productCategory/CategoryList';
import { mutations, queries } from '../../graphql';
import {
  ProductCategoriesCountQueryResponse,
  ProductCategoriesQueryResponse,
  ProductCategoryRemoveMutationResponse
} from '../../types';

type Props = { history: any; queryParams: any };

type FinalProps = {
  productCategoriesQuery: ProductCategoriesQueryResponse;
  productCategoriesCountQuery: ProductCategoriesCountQueryResponse;
} & Props &
  ProductCategoryRemoveMutationResponse;

class ProductListContainer extends React.Component<FinalProps> {
  render() {
    const {
      productCategoriesQuery,
      productCategoriesCountQuery,
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
      refetch: productCategoriesQuery.refetch,
      productCategories,
      loading: productCategoriesQuery.loading,
      productCategoriesCount:
        productCategoriesCountQuery.productCategoriesTotalCount || 0
    };

    return <List {...updatedProps} />;
  }
}

const getRefetchQueries = () => {
  return ['productCategories', 'productCategoriesTotalCount'];
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
        options: () => ({
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
    )
  )(ProductListContainer)
);
