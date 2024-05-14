import { Chooser, Spinner } from '@erxes/ui/src';
import { withProps } from '@erxes/ui/src/utils/core';
import { gql, useQuery } from '@apollo/client';
import * as compose from 'lodash.flowright';
import React, { useState } from 'react';
import { graphql } from '@apollo/client/react/hoc';
import AssetForm from '../../../asset/containers/AssetForm';
import { queries } from '../graphql';
import { IAsset, IAssetQueryResponse } from '../../../common/types';

type Props = {
  closeModal: () => void;
  handleSelect: (datas: IAsset[]) => void;
  selectedAssetIds: string[];
  ignoreIds?: string[];
  limit?: number;
};

const AssetChooser = (props: Props) => {
  const { ignoreIds, selectedAssetIds, limit, closeModal, handleSelect } =
    props;

  const [perPage, setPerPage] = useState<number>(20);

  const assetsQuery = useQuery<IAssetQueryResponse>(gql(queries.assets), {
    variables: {
      perPage: 20,
      searchValue: '',
      ignoreIds: [...(ignoreIds || []), ...(selectedAssetIds || [])],
    },
    fetchPolicy: 'network-only',
  });

  const selectedAssetsQuery = useQuery<IAssetQueryResponse>(
    gql(queries.assets),
    {
      skip: !(selectedAssetIds || []).length,
      variables: {
        perPage: (selectedAssetIds || []).length || undefined,
        ids: selectedAssetIds,
      },
      fetchPolicy: 'network-only',
    },
  );

  const assetAddForm = (props) => {
    const updatedProps = {
      ...props,
      assets: assetsQuery?.data?.assets,
    };

    return <AssetForm {...updatedProps} />;
  };

  const search = (value: string, reload?: boolean) => {
    if (!reload) {
      setPerPage(0);
    }

    setPerPage((prevPage) => prevPage + 5);

    assetsQuery.refetch({
      searchValue: value,
      perPage,
    });
  };

  if (assetsQuery.loading && selectedAssetsQuery?.loading) {
    return <Spinner />;
  }

  const listAssets = assetsQuery?.data?.assets || [];
  const selectedItems = selectedAssetsQuery?.data?.assets || [];

  return (
    <Chooser
      title="Asset Chooser"
      datas={[...listAssets, ...selectedItems]}
      data={{ name: 'Asset', datas: selectedItems }}
      search={search}
      clearState={() => search('', true)}
      renderForm={assetAddForm}
      onSelect={handleSelect}
      closeModal={() => closeModal()}
      renderName={(asset) => asset.name}
      perPage={5}
      limit={limit}
    />
  );
};

export default AssetChooser;
