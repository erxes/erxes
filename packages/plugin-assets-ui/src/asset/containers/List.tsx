import React from 'react';
import { Alert, Bulk, Spinner } from '@erxes/ui/src';
import { withProps } from '@erxes/ui/src/utils/core';
import { graphql } from '@apollo/client/react/hoc';
import { generatePaginationParams } from '@erxes/ui/src/utils/router';
import { generateParamsIds, getRefetchQueries } from '../../common/utils';
import * as compose from 'lodash.flowright';
import { queries, mutations } from '../graphql';

import { gql } from '@apollo/client';
import {
  AssetRemoveMutationResponse,
  IAssetCategoryDetailQueryResponse,
  IAssetDetailQueryResponse,
  IAssetQueryResponse,
  IAssetTotalCountQueryResponse,
  MergeMutationResponse
} from '../../common/types';
import List from '../components/List';

type Props = {
  queryParams: any;
  history: any;
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

function ListContainer(props: FinalProps) {
  const {
    queryParams,
    history,
    assets,
    assetsCount,
    assetCategoryDetailQuery,
    assetDetailQuery,
    assetsMerge,
    assetsRemove,
    assetsAssignKbArticles
  } = props;

  const remove = ({ assetIds }, emptyBulk) => {
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

  const assignKbArticles = ({ ids, data, callback }) => {
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

  const mergeAssets = ({ ids, data, callback }) => {
    assetsMerge({
      variables: {
        assetIds: ids,
        assetFields: data
      }
    })
      .then((result: any) => {
        callback();

        Alert.success('You successfully merged a asset');
        history.push(
          `/settings/asset-movements/detail/${result.data.assetsMerge._id}`
        );
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const assetList = bulkProps => {
    const updatedProps = {
      ...props,
      assets: assets?.assets || [],
      assetsCount: assetsCount.assetsTotalCount || 0,
      remove,
      assignKbArticles,
      mergeAssets,
      loading: assets.loading || assetsCount.loading,
      queryParams,
      currentCategory: assetCategoryDetailQuery.assetCategoryDetail || {},
      currentParent: assetDetailQuery.assetDetail || {},
      searchValue: queryParams.searchValue || ''
    };

    return <List {...bulkProps} {...updatedProps} />;
  };

  const refetch = () => {
    assets.refetch();
  };

  return <Bulk content={assetList} refetch={refetch} />;
}

const generateQueryParams = queryParams => {
  return {
    categoryId: queryParams?.assetCategoryId,
    parentId: queryParams?.assetId,
    searchValue: queryParams?.searchValue,
    type: queryParams?.type,
    irregular: Boolean(queryParams?.irregular),
    articleIds: generateParamsIds(queryParams?.articleIds),
    withKnowledgebase: queryParams?.state
      ? queryParams?.state === 'Assigned'
        ? true
        : false
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
    graphql<Props>(gql(queries.assetCategoryDetail), {
      name: 'assetCategoryDetailQuery',
      options: ({ queryParams }) => ({
        variables: {
          _id: queryParams?.assetCategoryId
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
