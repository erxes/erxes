import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { IUser } from 'modules/auth/types';
import EmptyState from 'modules/common/components/EmptyState';
import Spinner from 'modules/common/components/Spinner';
import { withProps } from 'modules/common/utils';
import { ProductTemplateDetailQueryResponse } from '../../../types';
import React from 'react';
import { graphql } from 'react-apollo';
import ProductDetails from '../../../components/product/detail/ProductDetails';
import { queries } from '../../../graphql';

type Props = {
  id: string;
};

type FinalProps = {
  productTemplateDetailQuery: ProductTemplateDetailQueryResponse;
  currentUser: IUser;
} & Props;

const ProductDetailsContainer = (props: FinalProps) => {
  const { productTemplateDetailQuery, currentUser } = props;

  if (productTemplateDetailQuery.loading) {
    return <Spinner objective={true} />;
  }

  if (!productTemplateDetailQuery.productTemplateDetail) {
    return (
      <EmptyState text="Product not found" image="/images/actions/24.svg" />
    );
  }

  const productDetail = productTemplateDetailQuery.productTemplateDetail || {};

  const updatedProps = {
    ...props,
    loading: productTemplateDetailQuery.loading,
    productTemplate: productDetail,
    currentUser
  };

  return <ProductDetails {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, ProductTemplateDetailQueryResponse, { _id: string }>(
      gql(queries.productTemplateDetail),
      {
        name: 'productTemplateDetailQuery',
        options: ({ id }) => ({
          variables: {
            _id: id
          }
        })
      }
    )
  )(ProductDetailsContainer)
);
