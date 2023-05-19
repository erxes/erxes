import { withProps } from '@erxes/ui/src';
import { ProductCategoriesQueryResponse } from '@erxes/ui-products/src/types';
import { queries } from '@erxes/ui-products/src/graphql';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from 'react-apollo';

import List from '../components/CategoryList';

type Props = { history: any; queryParams: any };

type FinalProps = {
  productCategoriesQuery: ProductCategoriesQueryResponse;
} & Props;

class CollateralListContainer extends React.Component<FinalProps> {
  render() {
    const { productCategoriesQuery } = this.props;

    const collateralCategories = productCategoriesQuery.productCategories || [];

    const updatedProps = {
      ...this.props,
      refetch: productCategoriesQuery.refetch,
      collateralCategories,
      collateralCategoriesCount: collateralCategories.length,
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
        options: {
          fetchPolicy: 'network-only'
        }
      }
    )
  )(CollateralListContainer)
);
