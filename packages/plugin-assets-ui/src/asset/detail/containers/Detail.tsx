import { IUser } from '@erxes/ui/src/auth/types';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import Spinner from '@erxes/ui/src/components/Spinner';
import { withProps } from '@erxes/ui/src/utils';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from 'react-apollo';
import {
  //   AssetsConfigsQueryResponse,
  IAsset,
  IAssetDetailQueryResponse
} from '../../../common/types';
import { queries } from '../../graphql';
import AssetDetails from '../components/Details';

type Props = {
  id: string;
};

type FinalProps = {
  assetDetailQuery: IAssetDetailQueryResponse;
  //   assetsConfigsQuery: AssetsConfigsQueryResponse;
  currentUser: IUser;
} & Props;

const AssetDetailContainer = (props: FinalProps) => {
  const { assetDetailQuery, currentUser } = props;

  if (assetDetailQuery.loading) {
    return <Spinner objective={true} />;
  }

  if (!assetDetailQuery.assetDetail) {
    return <EmptyState text="Asset not found" image="/images/actions/24.svg" />;
  }

  const assetDetail = assetDetailQuery.assetDetail || ({} as IAsset);

  const updatedProps = {
    ...props,
    loading: assetDetailQuery.loading,
    asset: assetDetail,
    currentUser
  };

  return <AssetDetails {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, IAssetDetailQueryResponse, { _id: string }>(gql(queries.assetDetail), {
      name: 'assetDetailQuery',
      options: ({ id }) => ({
        variables: {
          _id: id
        }
      })
    })
  )(AssetDetailContainer)
);
