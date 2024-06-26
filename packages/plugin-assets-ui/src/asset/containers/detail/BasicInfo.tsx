import { AssetRemoveMutationResponse, IAsset } from '../../../common/types';
import { gql, useMutation } from '@apollo/client';

import { Alert } from '@erxes/ui/src/utils';
import BasicInfo from '../../components/detail/BasicInfo';
import React from 'react';
import { mutations } from '../../graphql';
import { useNavigate } from 'react-router-dom';

type Props = {
  asset: IAsset;
  refetchQueries?: any[];
};

const BasicInfoContainer = (props: Props) => {
  const { asset } = props;
  const navigate = useNavigate();

  const { _id } = asset;

  const [assetsRemove] = useMutation<AssetRemoveMutationResponse>(
    gql(mutations.assetsRemove),
    {
      refetchQueries: generateOptions()
    }
  );

  const [assetsAssignKbArticles] = useMutation(
    gql(mutations.assetsAssignKbArticles),
    {
      refetchQueries: generateOptions()
    }
  );

  const remove = () => {
    assetsRemove({ variables: { assetIds: [_id] } })
      .then(() => {
        Alert.success('You successfully deleted a asset');
        navigate('/settings/asset-service');
      })
      .catch((e) => {
        Alert.error(e.message);
      });
  };

  const assignKbArticles = ({ ids, data, callback }) => {
    assetsAssignKbArticles({
      variables: { ids, ...data }
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
    assignKbArticles
  };

  return <BasicInfo {...updatedProps} />;
};

const generateOptions = () => {
  return ['assets', 'assetCategories', 'assetsTotalCount', 'assetDetail'];
};

export default BasicInfoContainer;
