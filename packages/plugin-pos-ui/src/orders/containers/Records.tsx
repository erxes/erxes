import * as compose from 'lodash.flowright';
import { gql, useQuery } from '@apollo/client';
import Records from '../components/Records';
import queryString from 'query-string';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import { IRouterProps } from '@erxes/ui/src/types';
import {
  ListQueryVariables,
  OrderRecordsQueryResponse,
  OrderRecordsCountQueryResponse,
} from '../types';
import { queries } from '../graphql';
import { withRouter } from 'react-router-dom';
import { Bulk, getEnv, withProps, router, Spinner } from '@erxes/ui/src';
import { FILTER_PARAMS } from '../../constants';
import { IQueryParams } from '@erxes/ui/src/types';
import { generateParams } from './List';

type Props = {
  queryParams: any;
  history: any;
} & IRouterProps;

const RecordsContainer = (props: Props) => {
  const { queryParams, history } = props;

  const ordersQuery = useQuery<OrderRecordsQueryResponse>(
    gql(queries.posOrderRecords),
    {
      variables: generateParams({ queryParams } || {}),
      fetchPolicy: 'network-only',
    },
  );

  const ordersCountQuery = useQuery<OrderRecordsCountQueryResponse>(
    gql(queries.posOrderRecordsCount),
    {
      variables: generateParams({ queryParams } || {}),
      fetchPolicy: 'network-only',
    },
  );

  const onSearch = (search: string) => {
    router.removeParams(history, 'page');

    if (!search) {
      return router.removeParams(history, 'search');
    }

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

  const ordersList = (bulkProps) => {
    const list = ordersQuery?.data?.posOrderRecords || [];
    const count = ordersCountQuery?.data?.posOrderRecordsCount || [];

    const exportOrderRecords = (headers) => {
      const { REACT_APP_API_URL } = getEnv();
      const params = generateParams({ queryParams });

      const stringified = queryString.stringify({
        ...params,
      });

      window.open(
        `${REACT_APP_API_URL}/pl:pos/file-export?${stringified}`,
        '_blank',
      );
    };

    const updatedProps = {
      ...props,
      orders: list,
      count,
      loading: ordersQuery.loading,

      onFilter,
      onSelect,
      onSearch,
      isFiltered: isFiltered(),
      clearFilter,
      exportRecord: exportOrderRecords,
    };

    return <Records {...updatedProps} {...bulkProps} />;
  };

  const refetch = () => {
    ordersQuery.refetch();
  };

  if (ordersQuery.loading || ordersCountQuery.loading) {
    return <Spinner />;
  }

  return <Bulk content={ordersList} refetch={refetch} />;
};

export default withRouter<Props>(RecordsContainer);
