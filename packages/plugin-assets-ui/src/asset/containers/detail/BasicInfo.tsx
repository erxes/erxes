import { IRouterProps } from '@erxes/ui/src/types';
import { Alert } from '@erxes/ui/src/utils';
import { gql, useMutation } from '@apollo/client';
import React from 'react';
import { withRouter } from 'react-router-dom';
import { AssetRemoveMutationResponse, IAsset } from '../../../common/types';
import { mutations } from '../../graphql';
import BasicInfo from '../../components/detail/BasicInfo';

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

export default withRouter<Props>(BasicInfoContainer);
