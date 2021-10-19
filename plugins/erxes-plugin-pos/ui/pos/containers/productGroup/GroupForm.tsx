import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { withProps } from 'erxes-ui';
import React from 'react';
import { graphql } from 'react-apollo';
import { queries } from 'erxes-ui/lib/products/graphql';
import { IProductGroup, ProductCategoriesQueryResponse } from '../../../types';
import GroupForm from '../../components/productGroup/GroupForm';
import { Spinner } from 'erxes-ui';

type Props = {
  closeModal: () => void;
  onSubmit: (group: IProductGroup) => void;
  history: any;
  queryParams: any;
  ongroup: IProductGroup;
};

type FinalProps = {
  productCategoriesQuery: ProductCategoriesQueryResponse;
} & Props;

class GroupContainer extends React.Component<FinalProps> {
  render() {
    const { productCategoriesQuery } = this.props;

    const categories = productCategoriesQuery.productCategories || [];

    if (productCategoriesQuery.loading) {
      return <Spinner objective={true} />;
    }
    console.log('asd asd = ', categories);
    const updatedProps = {
      ...this.props,
      categories
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
