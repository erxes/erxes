import EmptyState from '@erxes/ui/src/components/EmptyState';
import Spinner from '@erxes/ui/src/components/Spinner';
import { gql, useQuery } from '@apollo/client';
import React from 'react';
import { IAsset, IAssetDetailQueryResponse } from '../../../common/types';
import { queries } from '../../graphql';
import AssetDetails from '../../components/detail/Detail';

type Props = {
  id: string;
};

const AssetDetailContainer = (props: Props) => {
  const { id } = props;

  const assetDetailQuery = useQuery<IAssetDetailQueryResponse>(
    gql(queries.assetDetail),
    {
      variables: {
        _id: id,
      },
    },
  );

  if (assetDetailQuery.loading) {
    return <Spinner objective={true} />;
  }

  if (!assetDetailQuery?.data?.assetDetail) {
    return <EmptyState text="Asset not found" image="/images/actions/24.svg" />;
  }

  const assetDetail = assetDetailQuery?.data?.assetDetail || ({} as IAsset);

  const refetchDetail = () => {
    assetDetailQuery.refetch();
  };

  const updatedProps = {
    ...props,
    loading: assetDetailQuery.loading,
    asset: assetDetail,
    refetchDetail,
  };

  return <AssetDetails {...updatedProps} />;
};

export default AssetDetailContainer;
