import * as compose from 'lodash.flowright';
import { gql, useQuery } from '@apollo/client';
import List from '../components/ProductList';
import React from 'react';
import { Bulk, withProps, router, Spinner } from '@erxes/ui/src';
import { graphql } from '@apollo/client/react/hoc';
import { IRouterProps, IQueryParams } from '@erxes/ui/src/types';
import { PosProductsQueryResponse } from '../types';
import { queries } from '../graphql';
import { FILTER_PARAMS } from '../../constants';
import queryString from 'query-string';
import { generateParams } from './List';

type Props = {
  queryParams: any;
  history: any;
  type?: string;
};

const ProductList = (props: Props) => {
  const { type, history, queryParams } = props;

  const posProductsQuery = useQuery(gql(queries.posProducts), {
    variables: genParams({ queryParams } || {}),
    fetchPolicy: 'network-only',
  });

  const onSearch = (search: string) => {
    if (!search) {
      return router.removeParams(history, 'search');
    }
    router.removeParams(history, 'page');
    router.setParams(history, { search });
  };

  const onSelect = (values: string[] | string, key: string) => {
    router.removeParams(history, 'page');
    if (queryParams[key] === values) {
      return router.removeParams(history, key);
    }

    return router.setParams(history, { [key]: values });
  };

  const onFilter = (filterParams: IQueryParams) => {
    router.removeParams(history, 'page');

    for (const key of Object.keys(filterParams)) {
      if (filterParams[key]) {
        router.setParams(history, { [key]: filterParams[key] });
      } else {
        router.removeParams(history, key);
      }
    }

    return router;
  };

  const isFiltered = (): boolean => {
    for (const param in queryParams) {
      if (FILTER_PARAMS.includes(param)) {
        return true;
      }
    }

    return false;
  };

  const clearFilter = () => {
    router.removeParams(history, ...Object.keys(queryParams));
  };

  if (posProductsQuery.loading) {
    return <Spinner />;
  }

  const productList = (bulkProps) => {
    const products =
      (posProductsQuery && posProductsQuery?.data?.posProducts.products) || [];
    const totalCount =
      (posProductsQuery && posProductsQuery?.data?.posProducts.totalCount) || 0;

    const searchValue = queryParams.searchValue || '';

    const updatedProps = {
      ...props,
      queryParams,
      products,
      totalCount,
      loading: posProductsQuery.loading,
      searchValue,

      onFilter,
      onSelect,
      onSearch,
      isFiltered: isFiltered(),
      clearFilter,
    };

    return <List {...updatedProps} {...bulkProps} />;
  };

  const refetch = () => {
    posProductsQuery.refetch();
  };

  return <Bulk content={productList} refetch={refetch} />;
};

export const genParams = ({ queryParams }) => ({
  ...generateParams({ queryParams }),
  searchValue: queryParams.searchValue,
  categoryId: queryParams.categoryId,
});

export default ProductList;
