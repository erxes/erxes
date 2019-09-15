import gql from 'graphql-tag';
import { withProps } from 'modules/common/utils';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import List from '../../components/ProductCategory/CategoryList';
import { queries } from '../../graphql';
import {
  ProductCategoriesCountQueryResponse,
  ProductCategoriesQueryResponse
} from '../../types';

type Props = {
  queryParams: any;
};

type FinalProps = {
  productCategoriesQuery: ProductCategoriesQueryResponse;
  productCategoriesCountQuery: ProductCategoriesCountQueryResponse;
} & Props;

class ProductListContainer extends React.Component<FinalProps> {
  render() {
    const {
      productCategoriesQuery,
      productCategoriesCountQuery,

      queryParams
    } = this.props;

    const productCategories = productCategoriesQuery.productCategories || [];

    // remove action

    const updatedProps = {
      ...this.props,
      queryParams,
      productCategories,
      loading: productCategoriesQuery.loading,
      productCategoriesCount:
        productCategoriesCountQuery.productCategoriesTotalCount || 0
    };

    return <List {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, ProductCategoriesQueryResponse, { parentId: string }>(
      gql(queries.productCategories),
      {
        name: 'productCategoriesQuery',
        options: ({ queryParams }) => ({
          variables: queryParams.parentId
        })
      }
    ),
    graphql<Props, ProductCategoriesCountQueryResponse>(
      gql(queries.productCategoriesCount),
      {
        name: 'productCategoriesCountQuery'
      }
    )
  )(ProductListContainer)
);
