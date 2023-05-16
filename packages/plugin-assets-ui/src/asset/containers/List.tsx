import { Alert, Bulk, Spinner } from '@erxes/ui/src';
import { withProps } from '@erxes/ui/src/utils/core';
import { generatePaginationParams } from '@erxes/ui/src/utils/router';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from 'react-apollo';
import {
  AssetRemoveMutationResponse,
  IAssetCategoryDetailQueryResponse,
  IAssetDetailQueryResponse,
  IAssetQueryResponse,
  IAssetTotalCountQueryResponse,
  MergeMutationResponse
} from '../../common/types';
import { queries as categoryQueries } from '../category/graphql';
import List from '../components/List';
import { mutations, queries } from '../graphql';

import { generateParamsIds, getRefetchQueries } from '../../common/utils';

type Props = {
  queryParams: any;
  history: any;
  type?: string;
};
type FinalProps = {
  assets: IAssetQueryResponse;
  assetsCount: IAssetTotalCountQueryResponse;
  assetCategoryDetailQuery: IAssetCategoryDetailQueryResponse;
  assetDetailQuery: IAssetDetailQueryResponse;
  assetsAssignKbArticles: any;
} & Props &
  AssetRemoveMutationResponse &
  MergeMutationResponse;
class ListContainer extends React.Component<FinalProps> {
  constructor(props) {
    super(props);
    this.state = {
      mergeAssetLoading: false
    };

    this.assetList = this.assetList.bind(this);
  }

  remove = ({ assetIds }, emptyBulk) => {
    const { assetsRemove } = this.props;

    assetsRemove({
      variables: { assetIds }
    })
      .then(removeStatus => {
        emptyBulk();

        const status = removeStatus.data.assetsRemove;

        status === 'deleted'
          ? Alert.success('You successfully deleted a asset')
          : Alert.warning('Asset status deleted');
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  assignKbArticles = ({ ids, data, callback }) => {
    const { queryParams, assetsAssignKbArticles } = this.props;

    console.log({ ...data });

    assetsAssignKbArticles({
      variables: { ids, ...generateQueryParams(queryParams), ...data }
    })
      .then(() => {
        Alert.success('Success');
        callback();
      })
      .catch(e => {
        Alert.error(e.message);
        callback();
      });
  };

  mergeAssets = ({ ids, data, callback }) => {
    const { assetsMerge, history } = this.props;

    this.setState({ mergeAssetLoading: true });

    assetsMerge({
      variables: {
        assetIds: ids,
        assetFields: data
      }
    })
      .then((result: any) => {
        callback();
        this.setState({ mergeAssetLoading: false });
        Alert.success('You successfully merged a asset');
        history.push(
          `/settings/asset-movements/detail/${result.data.assetsMerge._id}`
        );
      })
      .catch(e => {
        Alert.error(e.message);
        this.setState({ mergeAssetLoading: false });
      });
  };

  assetList(props) {
    const {
      assets,
      assetsCount,
      queryParams,
      assetCategoryDetailQuery,
      assetDetailQuery
    } = this.props;
    if (assets.loading || assetsCount.loading) {
      return <Spinner />;
    }

    const updatedProps = {
      ...this.props,
      assets: assets?.assets,
      assetsCount: assetsCount.assetsTotalCount,
      remove: this.remove,
      assignKbArticles: this.assignKbArticles,
      mergeAssets: this.mergeAssets,
      loading: assets.loading,
      queryParams,
      currentCategory: assetCategoryDetailQuery.assetCategoryDetail || {},
      currentParent: assetDetailQuery.assetDetail || {},
      searchValue: queryParams.searchValue || ''
    };

    return <List {...props} {...updatedProps} />;
  }

  render() {
    const refetch = () => {
      this.props.assets.refetch();
    };

    return <Bulk content={this.assetList} refetch={refetch} />;
  }
}

const generateQueryParams = queryParams => {
  return {
    categoryId: queryParams?.categoryId,
    parentId: queryParams?.parentId,
    searchValue: queryParams?.searchValue,
    type: queryParams?.type,
    irregular: Boolean(queryParams?.irregular),
    articleIds: generateParamsIds(queryParams?.articleIds),
    withKnowledgebase: queryParams?.withKnowledge
      ? queryParams?.withKnowledge === 'true'
      : undefined,
    ...generatePaginationParams(queryParams || {})
  };
};

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.assets), {
      name: 'assets',
      options: ({ queryParams }) => ({
        variables: generateQueryParams(queryParams),
        fetchPolicy: 'network-only'
      })
    }),
    graphql<Props>(gql(queries.assetsCount), {
      name: 'assetsCount',
      options: ({ queryParams }) => ({
        variables: generateQueryParams(queryParams),
        fetchPolicy: 'network-only'
      })
    }),
    graphql<Props>(gql(queries.assetDetail), {
      name: 'assetDetailQuery',
      options: ({ queryParams }) => ({
        variables: {
          _id: queryParams?.parentId
        }
      })
    }),
    graphql<Props>(gql(categoryQueries.assetCategoryDetail), {
      name: 'assetCategoryDetailQuery',
      options: ({ queryParams }) => ({
        variables: {
          _id: queryParams?.categoryId
        }
      })
    }),
    graphql(gql(mutations.assetsMerge), {
      name: 'assetsMerge'
    }),
    graphql(gql(mutations.assetsRemove), {
      name: 'assetsRemove',
      options: () => ({
        refetchQueries: getRefetchQueries()
      })
    }),
    graphql(gql(mutations.assetsAssignKbArticles), {
      name: 'assetsAssignKbArticles',
      options: () => ({
        refetchQueries: getRefetchQueries()
      })
    })
  )(ListContainer)
);
