import * as compose from 'lodash.flowright';

import { Alert, withProps } from '@erxes/ui/src/utils';
// import { withRouter } from 'react-router-dom';
import { AssetRemoveMutationResponse, IAsset } from '../../../common/types';

import BasicInfo from '../../components/detail/BasicInfo';
import { IRouterProps } from '@erxes/ui/src/types';
import { IUser } from '@erxes/ui/src/auth/types';
import React from 'react';
import { gql, useMutation } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { mutations } from '../../graphql';

type Props = {
  asset: IAsset;
  refetchQueries?: any[];
} & IRouterProps;

const BasicInfoContainer = (props: Props) => {
  const { asset, history } = props;

  const { _id } = asset;

  const [assetsRemove] = useMutation<AssetRemoveMutationResponse>(
    gql(mutations.assetsRemove),
    {
      refetchQueries: generateOptions(),
    },
  );

  const [assetsAssignKbArticles] = useMutation(gql(mutations.assetsRemove), {
    refetchQueries: generateOptions(),
  });

  const remove = () => {
    assetsRemove({ variables: { assetIds: [_id] } })
      .then(() => {
        Alert.success('You successfully deleted a asset');
        history.push('/settings/asset-service');
      })
      .catch((e) => {
        Alert.error(e.message);
      });
  };

  const assignKbArticles = ({ ids, data, callback }) => {
    assetsAssignKbArticles({
      variables: { ids, ...data },
    })
      .then(() => {
        Alert.success('Articles assigned successfully');
        callback();
      })
      .catch((e) => {
        Alert.error(e.message);
        callback();
      });
  };

  const updatedProps = {
    ...props,
    remove,
    assignKbArticles,
  };

  return <BasicInfo {...updatedProps} />;
};

const generateOptions = () => {
  return ['assets', 'assetCategories', 'assetsTotalCount', 'assetDetail'];
};

export default BasicInfoContainer;
// export default withRouter<Props>(BasicInfoContainer);
