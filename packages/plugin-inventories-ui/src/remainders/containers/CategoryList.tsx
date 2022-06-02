import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { withProps } from '@erxes/ui/src';
import React from 'react';
import { graphql } from 'react-apollo';
import List from '../components/CategoryList';
import { queries } from '../graphql';
import { ProductCategoriesQueryResponse } from '../types';

type Props = { history: any; queryParams: any };

type FinalProps = {
  productCategoriesQuery: ProductCategoriesQueryResponse;
} & Props;

class ProductListContainer extends React.Component<FinalProps> {
  render() {
    const { productCategoriesQuery } = this.props;

    const productCategories = productCategoriesQuery.productCategories || [];

    const updatedProps = {
      ...this.props,
      productCategories,
      loading: productCategoriesQuery.loading
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
          variables: {
            status: queryParams.status,
            parentId: queryParams.parentId
          },
          fetchPolicy: 'network-only'
        })
      }
    )
  )(ProductListContainer)
);
