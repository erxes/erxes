import * as compose from 'lodash.flowright';

import { Alert, withProps } from '@erxes/ui/src/utils';
import { IProduct, ProductRemoveMutationResponse } from '../../../types';

import BasicInfo from '../../../components/product/detail/BasicInfo';
import { IRouterProps } from '@erxes/ui/src/types';
// import { withRouter } from 'react-router-dom';
import { IUser } from '@erxes/ui/src/auth/types';
import React from 'react';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { mutations } from '../../../graphql';

type Props = {
  product: IProduct;
  refetchQueries?: any[];
};

type FinalProps = {
  currentUser: IUser;
} & Props &
  IRouterProps &
  ProductRemoveMutationResponse;

const BasicInfoContainer = (props: FinalProps) => {
  const { product, productsRemove, history } = props;

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

const generateOptions = () => ({
  refetchQueries: ['products', 'productCategories', 'productsTotalCount'],
});

export default withProps<Props>(
  compose(
    graphql<{}, ProductRemoveMutationResponse, { productIds: string[] }>(
      gql(mutations.productsRemove),
      {
        name: 'productsRemove',
        options: generateOptions,
      },
    ),
  )(BasicInfoContainer),
);
