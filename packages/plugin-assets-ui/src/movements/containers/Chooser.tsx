import { Chooser, Spinner } from '@erxes/ui/src';
import { withProps } from '@erxes/ui/src/utils/core';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from 'react-apollo';
import AssetForm from '../../asset/containers/Form';
import { queries } from '../graphql';
import { IAsset, IAssetQueryResponse } from '../../common/types';
type Props = {
  closeModal: () => void;
  handleSelect: (datas: IAsset[]) => void;
  selectedAssetIds: string[];
  ignoreIds?: string[];
  limit?: number;
};

type FinalProps = {
  assets: IAssetQueryResponse;
  selectedAssets: IAssetQueryResponse;
} & Props;

type State = {
  perpage: number;
  searchValue: string;
};

class AssetChooser extends React.Component<FinalProps, State> {
  constructor(props) {
    super(props);

    this.assetAddForm = this.assetAddForm.bind(this);

    this.state = {
      perpage: 20,
      searchValue: ''
    };

    this.search = this.search.bind(this);
  }

  assetAddForm(props) {
    const updatedProps = {
      ...props,
      assets: this.props.assets.assets
    };

    return <AssetForm {...updatedProps} />;
  }

  search(value: string, reload?: boolean) {
    if (!reload) {
      this.setState({ perpage: 0 });
    }
    this.setState({ perpage: this.state.perpage + 5 }, () =>
      this.props.assets.refetch({
        searchValue: value,
        perPage: this.state.perpage
      })
    );
  }

  render() {
    const {
      closeModal,
      assets,
      handleSelect,
      limit,
      selectedAssets
    } = this.props;

    if (assets.loading && selectedAssets?.loading) {
      return <Spinner />;
    }

    const listAssets = assets?.assets || [];
    const selectedItems = selectedAssets?.assets || [];

    return (
      <Chooser
        title="Asset Chooser"
        datas={[...listAssets, ...selectedItems]}
        data={{ name: 'Asset', datas: selectedItems }}
        search={this.search}
        clearState={() => this.search('', true)}
        renderForm={this.assetAddForm}
        onSelect={handleSelect}
        closeModal={() => closeModal()}
        renderName={asset => asset.name}
        perPage={5}
        limit={limit}
      />
    );
  }
}

export default withProps(
  compose(
    graphql<Props>(gql(queries.assets), {
      name: 'assets',
      options: ({ ignoreIds, selectedAssetIds }) => ({
        variables: {
          perPage: 20,
          searchValue: '',
          ignoreIds: [...(ignoreIds || []), ...(selectedAssetIds || [])]
        },
        fetchPolicy: 'network-only'
      })
    }),
    graphql<Props>(gql(queries.assets), {
      name: 'selectedAssets',
      skip: ({ selectedAssetIds }) => !(selectedAssetIds || []).length,
      options: ({ selectedAssetIds }) => ({
        variables: {
          perPage: selectedAssetIds.length || undefined,
          ids: selectedAssetIds
        },
        fetchPolicy: 'network-only'
      })
    })
  )(AssetChooser)
);
