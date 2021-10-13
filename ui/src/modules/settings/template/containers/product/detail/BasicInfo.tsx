import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { Alert, withProps } from 'modules/common/utils';
import BasicInfo from 'modules/settings/template/components/product/detail/BasicInfo';
import React from 'react';
import { graphql } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import { IUser } from '../../../../../auth/types';
import { IRouterProps } from '../../../../../common/types';

import { mutations } from '../../../graphql';
import { ProductTemplatesRemoveMutationResponse, IProductTemplate } from '../../../types';

type Props = {
  productTemplate: IProductTemplate;
};

type FinalProps = { currentUser: IUser } & Props &
  IRouterProps &
  ProductTemplatesRemoveMutationResponse;

const BasicInfoContainer = (props: FinalProps) => {
  const { productTemplate, productTemplatesRemove, history } = props;

  const { _id } = productTemplate;

  const remove = () => {
    productTemplatesRemove({ variables: { ids: [_id] } })
      .then(() => {
        Alert.success('You successfully deleted a product template');
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
  refetchQueries: ['productTemplates']
});

export default withProps<Props>(
  compose(
    graphql<{}, ProductTemplatesRemoveMutationResponse, { ids: string[] }>(
      gql(mutations.productTemplatesRemove),
      {
        name: 'productTemplatesRemove',
        options: generateOptions
      }
    )
  )(withRouter<FinalProps>(BasicInfoContainer))
);
