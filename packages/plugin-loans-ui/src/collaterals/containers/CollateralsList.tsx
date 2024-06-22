import { gql } from '@apollo/client';
import { router } from '@erxes/ui/src';
import React, { useState } from 'react';
import CollateralsList from '../components/CollateralsList';
import { queries } from '../graphql';
import { MainQueryResponse } from '../types';
import { useQuery } from '@apollo/client';

type Props = {
  queryParams: any;
};

const CollateralListContainer = (props: Props) => {
  const [loading, setLoading] = useState(false);
  const { queryParams } = props;

  const collateralsMainQuery = useQuery<MainQueryResponse>(
    gql(queries.collateralsMain),
    {
      variables: {
        ...router.generatePaginationParams(queryParams || {}),
        ids: queryParams.ids,
        categoryId: queryParams.categoryId,
        productIds: queryParams.productIds,
        searchValue: queryParams.searchValue,
        sortField: queryParams.sortField,
        sortDirection: queryParams.sortDirection
          ? parseInt(queryParams.sortDirection, 10)
          : undefined,
      },
    },
  );

  const searchValue = queryParams.searchValue || '';
  const productIds = queryParams.productIds || '';
  const { list = [], totalCount = 0 } =
    collateralsMainQuery?.data?.collateralsMain || {};

  const updatedProps = {
    ...props,
    totalCount,
    searchValue,
    productIds,
    collaterals: list,
    loading: collateralsMainQuery.loading || loading,
  };

  return <CollateralsList {...updatedProps} />;
};

export default CollateralListContainer;
