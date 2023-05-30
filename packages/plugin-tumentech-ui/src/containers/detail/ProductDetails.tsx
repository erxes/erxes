import { EmptyState, Spinner } from '@erxes/ui/src';
import { IUser } from '@erxes/ui/src/auth/types';
import { withProps } from '@erxes/ui/src/utils';
import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';

import ProductDetails from '../../components/detail/ProductDetails';
import { queries } from '../../graphql';
import { DetailQueryResponse, IProduct } from '../../types';

type Props = {
  id: string;
  product: IProduct;
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

  const productDetail = productDetailQuery.productDetail;

  if (!productDetail) {
    return (
      <EmptyState text="Product not found" image="/images/actions/24.svg" />
    );
  }

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
