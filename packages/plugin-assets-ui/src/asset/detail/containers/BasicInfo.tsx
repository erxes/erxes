import { IUser } from '@erxes/ui/src/auth/types';
import { IRouterProps } from '@erxes/ui/src/types';
import { Alert, withProps } from '@erxes/ui/src/utils';
import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
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
  assetsAssignKbArticles: any;
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

  const assignKbArticles = ({ ids, data, callback }) => {
    const { assetsAssignKbArticles } = props;

    assetsAssignKbArticles({
      variables: { ids, ...data }
    })
      .then(() => {
        Alert.success('Articles assigned successfully');
        callback();
      })
      .catch(e => {
        Alert.error(e.message);
        callback();
      });
  };

  const updatedProps = {
    ...props,
    remove,
    assignKbArticles
  };

  return <BasicInfo {...updatedProps} />;
};

const generateOptions = () => ({
  refetchQueries: [
    'assets',
    'assetCategories',
    'assetsTotalCount',
    'assetDetail'
  ]
});

export default withProps<Props>(
  compose(
    graphql<{}, AssetRemoveMutationResponse, { assetIds: string[] }>(
      gql(mutations.assetsRemove),
      {
        name: 'assetsRemove',
        options: generateOptions
      }
    ),
    graphql(gql(mutations.assetsAssignKbArticles), {
      name: 'assetsAssignKbArticles',
      options: () => generateOptions()
    })
  )(withRouter<FinalProps>(BasicInfoContainer))
);
