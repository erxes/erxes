import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { Alert, withProps } from 'modules/common/utils';
import BasicInfo from 'modules/settings/productService/components/product/detail/BasicInfo';
import React from 'react';
import { graphql } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import { IUser } from '../../../../../auth/types';
import { IRouterProps } from '../../../../../common/types';

import { IProduct } from 'modules/settings/productService/types';
import { mutations } from '../../../graphql';
import { ProductRemoveMutationResponse } from '../../../types';

type Props = {
  product: IProduct;
  refetchQueries?: any[];
};

type FinalProps = { currentUser: IUser } & Props &
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
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const updatedProps = {
    ...props,
    remove
  };

  return <BasicInfo {...updatedProps} />;
};

const generateOptions = () => ({
  refetchQueries: ['products', 'productCategories', 'productsTotalCount']
});

export default withProps<Props>(
  compose(
    graphql<{}, ProductRemoveMutationResponse, { productIds: string[] }>(
      gql(mutations.productsRemove),
      {
        name: 'productsRemove',
        options: generateOptions
      }
    )
  )(withRouter<FinalProps>(BasicInfoContainer))
);
