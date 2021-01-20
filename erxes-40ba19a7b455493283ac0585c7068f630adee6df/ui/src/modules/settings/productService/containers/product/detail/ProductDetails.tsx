import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { IUser } from 'modules/auth/types';
import EmptyState from 'modules/common/components/EmptyState';
import Spinner from 'modules/common/components/Spinner';
import { withProps } from 'modules/common/utils';
import { DetailQueryResponse } from 'modules/settings/productService/types';
import React from 'react';
import { graphql } from 'react-apollo';
import ProductDetails from '../../../components/product/detail/ProductDetails';
import { queries } from '../../../graphql';

type Props = {
  id: string;
};

type FinalProps = {
  productDetailQuery: DetailQueryResponse;
  currentUser: IUser;
} & Props;

const ProductDetailsContainer = (props: FinalProps) => {
  const { productDetailQuery, currentUser } = props;

  if (productDetailQuery.loading) {
    return <Spinner objective={true} />;
  }

  if (!productDetailQuery.productDetail) {
    return (
      <EmptyState text="Product not found" image="/images/actions/24.svg" />
    );
  }

  const productDetail = productDetailQuery.productDetail || {};

  const updatedProps = {
    ...props,
    loading: productDetailQuery.loading,
    product: productDetail,
    currentUser
  };

  return <ProductDetails {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, DetailQueryResponse, { _id: string }>(
      gql(queries.productDetail),
      {
        name: 'productDetailQuery',
        options: ({ id }) => ({
          variables: {
            _id: id
          }
        })
      }
    )
  )(ProductDetailsContainer)
);
