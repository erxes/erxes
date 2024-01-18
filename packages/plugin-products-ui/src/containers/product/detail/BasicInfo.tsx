import { gql } from '@apollo/client';
import { Alert } from '@erxes/ui/src/utils';
import React from 'react';
import { withRouter } from 'react-router-dom';
import { IUser } from '@erxes/ui/src/auth/types';
import { IRouterProps } from '@erxes/ui/src/types';
import BasicInfo from '../../../components/product/detail/BasicInfo';
import { IProduct, ProductRemoveMutationResponse } from '../../../types';
import { mutations } from '../../../graphql';
import { useMutation } from '@apollo/client';

type Props = {
  product: IProduct;
  refetchQueries?: any[];
};

type FinalProps = {
  currentUser: IUser;
} & Props &
  IRouterProps;

const BasicInfoContainer = (props: FinalProps) => {
  const { product, history } = props;

  const [productsRemove] = useMutation<ProductRemoveMutationResponse>(
    gql(mutations.productsRemove),
    {
      refetchQueries: ['products', 'productCategories', 'productsTotalCount'],
    },
  );

  const { _id } = product;

  const remove = () => {
    productsRemove({ variables: { productIds: [_id] } })
      .then(() => {
        Alert.success('You successfully deleted a product');
        history.push('/settings/product-service');
      })
      .catch((e) => {
        Alert.error(e.message);
      });
  };

  const updatedProps = {
    ...props,
    remove,
  };

  return <BasicInfo {...updatedProps} />;
};

export default withRouter<FinalProps>(BasicInfoContainer);
