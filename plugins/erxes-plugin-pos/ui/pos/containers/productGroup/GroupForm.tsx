import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { withProps } from 'erxes-ui';
import React from 'react';
import { graphql } from 'react-apollo';
import { queries } from 'erxes-ui/lib/products/graphql';
import { IProductGroup, ProductCategoriesQueryResponse } from '../../../types';
import GroupForm from '../../components/productGroup/GroupForm';

type Props = { history: any; queryParams: any; group: IProductGroup };

type FinalProps = {
  productCategoriesQuery: ProductCategoriesQueryResponse;
} & Props;

class GroupContainer extends React.Component<FinalProps> {
  render() {
    const { productCategoriesQuery } = this.props;


    console.log('productCategoriesQuery: ',productCategoriesQuery.productCategories)

    const updatedProps = {
      ...this.props,

      categories: productCategoriesQuery.productCategories || [],
      loading: productCategoriesQuery.loading
    };

    return <GroupForm {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, ProductCategoriesQueryResponse>(
      gql(queries.productCategories),
      {
        name: 'productCategoriesQuery',
        options: () => ({
          fetchPolicy: 'network-only'
        })
      }
    )
  )(GroupContainer)
);
