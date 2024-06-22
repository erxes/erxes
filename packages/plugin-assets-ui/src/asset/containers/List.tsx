import { Alert, Bulk } from '@erxes/ui/src';
import {
  IAssetCategoryDetailQueryResponse,
  IAssetDetailQueryResponse,
  IAssetQueryResponse,
  IAssetTotalCountQueryResponse,
} from '../../common/types';
import { generateParamsIds, getRefetchQueries } from '../../common/utils';
import { gql, useMutation, useQuery } from '@apollo/client';
import { mutations, queries } from '../graphql';

import List from '../components/List';
import React from 'react';
import { generatePaginationParams } from '@erxes/ui/src/utils/router';
import { useNavigate } from 'react-router-dom';

type Props = {
  queryParams: any;
};

const generateQueryParams = (queryParams) => {
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
    ...generatePaginationParams(queryParams || {}),
  };
};

const ListContainer = (props: Props) => {
  const { queryParams } = props;
  const navigate = useNavigate();

  const assetsQuery = useQuery<IAssetQueryResponse>(gql(queries.assets), {
    variables: generateQueryParams(queryParams),
    fetchPolicy: 'network-only',
  });

  const assetsCountQuery = useQuery<IAssetTotalCountQueryResponse>(
    gql(queries.assetsCount),
    {
      variables: generateQueryParams(queryParams),
      fetchPolicy: 'network-only',
    }
  );

  const assetDetailQuery = useQuery<IAssetDetailQueryResponse>(
    gql(queries.assetDetail),
    {
      variables: {
        _id: queryParams?.assetCategoryId,
      },
    }
  );

  const assetCategoryDetailQuery = useQuery<IAssetCategoryDetailQueryResponse>(
    gql(queries.assetCategoryDetail),
    {
      variables: {
        _id: queryParams?.assetCategoryId,
      },
    }
  );

  const [assetsMerge] = useMutation(gql(mutations.assetsMerge));
  const [assetsRemove] = useMutation(gql(mutations.assetsRemove), {
    refetchQueries: getRefetchQueries(),
  });
  const [assetsAssignKbArticles] = useMutation(
    gql(mutations.assetsAssignKbArticles),
    {
      refetchQueries: getRefetchQueries(),
    }
  );

  const remove = ({ assetIds }, emptyBulk) => {
    assetsRemove({
      variables: { assetIds },
    })
      .then((removeStatus) => {
        emptyBulk();

        const status = removeStatus?.data?.assetsRemove;

        status === 'deleted'
          ? Alert.success('You successfully deleted a asset')
          : Alert.warning('Asset status deleted');
      })
      .catch((e) => {
        Alert.error(e.message);
      });
  };

  const assignKbArticles = ({ ids, data, callback }) => {
    assetsAssignKbArticles({
      variables: { ids, ...generateQueryParams(queryParams), ...data },
    })
      .then(() => {
        Alert.success('Success');
        callback();
      })
      .catch((e) => {
        Alert.error(e.message);
        callback();
      });
  };

  const mergeAssets = ({ ids, data, callback }) => {
    assetsMerge({
      variables: {
        assetIds: ids,
        assetFields: data,
      },
    })
      .then((result: any) => {
        callback();

        Alert.success('You successfully merged a asset');
        navigate(
          `/settings/asset-movements/detail/${result.data.assetsMerge._id}`
        );
      })
      .catch((e) => {
        Alert.error(e.message);
      });
  };

  const assetList = (bulkProps) => {
    const updatedProps = {
      ...props,
      assets: assetsQuery?.data?.assets || [],
      assetsCount: assetsCountQuery?.data?.assetsTotalCount || 0,
      remove,
      assignKbArticles,
      mergeAssets,
      loading: assetsQuery.loading || assetsCountQuery.loading,
      queryParams,
      currentCategory:
        assetCategoryDetailQuery?.data?.assetCategoryDetail || {},
      currentParent: assetDetailQuery?.data?.assetDetail || {},
      searchValue: queryParams.searchValue || '',
    };

    return <List {...bulkProps} {...updatedProps} />;
  };

  const refetch = () => {
    assetsQuery.refetch();
  };

  return <Bulk content={assetList} refetch={refetch} />;
};

export default ListContainer;
