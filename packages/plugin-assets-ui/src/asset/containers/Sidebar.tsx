import React from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';
import { mutations, queries } from '../graphql';
import {
  IAssetCategoryQeuryResponse,
  IAssetCategoriesTotalCountResponse,
} from '../../common/types';
import { Alert, confirm } from '@erxes/ui/src';
import Sidebar from '../components/Sidebar';

type Props = { queryParams: any };

const SidebarContainer = (props: Props) => {
  const { queryParams } = props;

  const assetCategoriesQuery = useQuery<IAssetCategoryQeuryResponse>(
    gql(queries.assetCategory),
    {
      variables: {
        status: queryParams?.status,
        parentId: queryParams?.parentId,
      },
      fetchPolicy: 'network-only',
    },
  );

  const assetCategoriesTotalCountQuery =
    useQuery<IAssetCategoriesTotalCountResponse>(
      gql(queries.assetCategoriesTotalCount),
    );

  const [assetCategoryRemove] = useMutation(
    gql(mutations.assetCategoryRemove),
    {
      refetchQueries: ['assetCategories', 'assetCategoryTotalCount', 'assets'],
    },
  );

  const removeAssetCategory = (_id) => {
    confirm().then(() => {
      assetCategoryRemove({ variables: { _id } })
        .then(() => {
          assetCategoriesQuery.refetch();
          Alert.success(`You successfully deleted a asset category`);
        })
        .catch((e) => {
          Alert.error(e.message);
        });
    });
  };

  const refetchCategory = () => {
    assetCategoriesQuery.refetch();
    assetCategoriesTotalCountQuery.refetch();
  };

  const updateProps = {
    assetCategories: assetCategoriesQuery?.data?.assetCategories || [],
    totalCount:
      assetCategoriesTotalCountQuery?.data?.assetCategoriesTotalCount || 0,
    loading:
      assetCategoriesQuery.loading || assetCategoriesTotalCountQuery.loading,
    remove: removeAssetCategory,
    refetchAssetCategories: refetchCategory,
    queryParams,
  };

  return <Sidebar {...updateProps} />;
};

export default SidebarContainer;
