import * as compose from 'lodash.flowright';
import { ListQueryVariables, OrdersGroupSummaryQueryResponse } from '../types';
// import { withRouter } from 'react-router-dom';
import { Spinner, router, withProps } from '@erxes/ui/src';

import { FILTER_PARAMS } from '../../constants';
import { IQueryParams } from '@erxes/ui/src/types';
import { IRouterProps } from '@erxes/ui/src/types';
import React from 'react';
import Summary from '../components/Summary';
import { generateParams } from './List';
import { gql, useQuery } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { queries } from '../graphql';
import queryString from 'query-string';

type Props = {
  queryParams: any;
  history: any;
};

const SummaryContainer = (props: Props) => {
  const { queryParams, history } = props;

  const ordersGroupSummaryQuery = useQuery(gql(queries.posOrdersGroupSummary), {
    variables: genParams({ queryParams } || {}),
    fetchPolicy: 'network-only',
  });

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

  if (ordersGroupSummaryQuery.loading) {
    return <Spinner />;
  }

  const summary = ordersGroupSummaryQuery?.data?.posOrdersGroupSummary;

  const updatedProps = {
    ...props,
    loading: ordersGroupSummaryQuery.loading,
    summary,
    onFilter,
    onSelect,
    onSearch,
    isFiltered: isFiltered(),
    clearFilter,
  };

  return <Summary {...updatedProps} />;
};

export const genParams = ({ queryParams }) => ({
  ...generateParams({ queryParams }),
  groupField: queryParams.groupField,
});

export default SummaryContainer;
