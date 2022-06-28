import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { IUser } from '@erxes/ui/src/auth/types';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import Spinner from '@erxes/ui/src/components/Spinner';
import { withProps } from '@erxes/ui/src/utils';

import React from 'react';
import { graphql } from 'react-apollo';
import ProductDetails from '../../../components/flow/detail/ProductDetails';
import { queries } from '../../../graphql';
import {
  DetailQueryResponse,
  IProduct,
  ProductsConfigsQueryResponse
} from '@erxes/ui-products/src/types';

type Props = {
  id: string;
};

type FinalProps = {
  productDetailQuery: DetailQueryResponse;
  productsConfigsQuery: ProductsConfigsQueryResponse;
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

  const productDetail = productDetailQuery.productDetail || ({} as IProduct);

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
