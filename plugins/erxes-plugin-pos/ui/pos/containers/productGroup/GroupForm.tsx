import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { withProps } from 'erxes-ui';
import React from 'react';
import { graphql } from 'react-apollo';
import { queries } from 'erxes-ui/lib/products/graphql';
import { queries as productQueries } from 'erxes-ui/lib/products/graphql';
import {
  IProductGroup,
  ProductCategoriesQueryResponse,
  ProductsQueryResponse
} from '../../../types';
import GroupForm from '../../components/productGroup/GroupForm';
import { Spinner } from 'erxes-ui';

type Props = {
  closeModal: () => void;
  onSubmit: (group: IProductGroup) => void;
  history: any;
  queryParams: any;
  group?: IProductGroup;
};

type FinalProps = {
  productsQuery: ProductsQueryResponse;
  productCategoriesQuery: ProductCategoriesQueryResponse;
} & Props;

class GroupContainer extends React.Component<FinalProps> {
  render() {
    const {
      productsQuery,
      productCategoriesQuery
    } = this.props;

    const categories = productCategoriesQuery.productCategories || [];
    const products = productsQuery.products || [];

    if (productCategoriesQuery.loading) {
      return <Spinner objective={true} />;
    }

    const updatedProps = {
      ...this.props,
      categories,
      products
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
    ),
    graphql<Props, ProductsQueryResponse>(gql(queries.products), {
      name: 'productsQuery',
      options: () => ({
        fetchPolicy: 'network-only'
      })
    })
  )(GroupContainer)
);
