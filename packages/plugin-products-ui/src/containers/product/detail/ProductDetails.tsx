import { gql } from '@apollo/client';
import { IUser } from '@erxes/ui/src/auth/types';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import Spinner from '@erxes/ui/src/components/Spinner';
import { DetailQueryResponse, IProduct } from '../../../types';
import React from 'react';
import ProductDetails from '../../../components/product/detail/ProductDetails';
import { queries } from '../../../graphql';
import { useQuery } from '@apollo/client';

type Props = {
  id: string;
};

type FinalProps = {
  currentUser: IUser;
} & Props;

const ProductDetailsContainer = (props: FinalProps) => {
  const { currentUser, id } = props;

  const productDetailQuery = useQuery<DetailQueryResponse>(
    gql(queries.productDetail),
    {
      variables: {
        _id: id,
      },
      notifyOnNetworkStatusChange: true,
      fetchPolicy: 'network-only',
    },
  );

  if (productDetailQuery.loading) {
    return <Spinner objective={true} />;
  }

  if (productDetailQuery.data && !productDetailQuery.data.productDetail) {
    return (
      <EmptyState text="Product not found" image="/images/actions/24.svg" />
    );
  }

  const productDetail =
    (productDetailQuery.data && productDetailQuery.data.productDetail) ||
    ({} as IProduct);

  const updatedProps = {
    ...props,
    loading: productDetailQuery.loading,
    product: productDetail,
    currentUser,
  };

  return <ProductDetails {...updatedProps} />;
};

export default ProductDetailsContainer;
