import { IUser } from '@erxes/ui/src/auth/types';
import { IRouterProps } from '@erxes/ui/src/types';
import { Alert, withProps } from '@erxes/ui/src/utils';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import { AssetRemoveMutationResponse, IAsset } from '../../../common/types';
import { mutations } from '../../graphql';
import BasicInfo from '../components/BasicInfo';

type Props = {
  asset: IAsset;
  refetchQueries?: any[];
  history: any;
};

type FinalProps = {
  currentUser: IUser;
} & Props &
  IRouterProps &
  AssetRemoveMutationResponse;

const BasicInfoContainer = (props: FinalProps) => {
  const { asset, assetsRemove, history } = props;

  const { _id } = asset;

  const remove = () => {
    assetsRemove({ variables: { assetIds: [_id] } })
      .then(() => {
        Alert.success('You successfully deleted a asset');
        history.push('/settings/asset-service');
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
  refetchQueries: ['assets', 'assetCategories', 'assetsTotalCount']
});

export default withProps<Props>(
  compose(
    graphql<{}, AssetRemoveMutationResponse, { assetIds: string[] }>(
      gql(mutations.assetsRemove),
      {
        name: 'assetsRemove',
        options: generateOptions
      }
    )
  )(withRouter<FinalProps>(BasicInfoContainer))
);
