import * as compose from 'lodash.flowright';
import { gql } from '@apollo/client';
import PutResponseByDate from '../components/PutResponsesByDate';
import queryString from 'query-string';
import React from 'react';
import { Spinner } from '@erxes/ui/src/components';
import { Alert, router, withProps } from '@erxes/ui/src/utils';
import { graphql } from '@apollo/client/react/hoc';
import { IRouterProps, IQueryParams } from '@erxes/ui/src/types';
import {
  ListQueryVariables,
  PutResponsesAmountQueryResponse,
  PutResponsesCountQueryResponse,
  PutResponsesByDateQueryResponse
} from '../types';
import { queries } from '../graphql';
import { withRouter } from 'react-router-dom';
import { FILTER_PARAMS } from '../constants';

type Props = {
  queryParams: any;
  history: any;
};

type FinalProps = {
  putResponsesByDateQuery: PutResponsesByDateQueryResponse;
  putResponsesCountQuery: PutResponsesCountQueryResponse;
  putResponsesAmountQuery: PutResponsesAmountQueryResponse;
} & Props &
  IRouterProps;

type State = {
  loading: boolean;
};

const generateQueryParams = ({ location }) => {
  return queryString.parse(location.search);
};

class PutResponsesContainer extends React.Component<FinalProps, State> {
  constructor(props) {
    super(props);

    this.state = {
      loading: false
    };
  }

  onSearch = (search: string, key?: string) => {
    router.removeParams(this.props.history, 'page');

    if (!search) {
      return router.removeParams(this.props.history, key || 'search');
    }

    router.setParams(this.props.history, { [key || 'search']: search });
  };

  onSelect = (values: string[] | string, key: string) => {
    const params = generateQueryParams(this.props.history);
    router.removeParams(this.props.history, 'page');

    if (params[key] === values) {
      return router.removeParams(this.props.history, key);
    }

    return router.setParams(this.props.history, { [key]: values });
  };

  onFilter = (filterParams: IQueryParams) => {
    router.removeParams(this.props.history, 'page');

    for (const key of Object.keys(filterParams)) {
      if (filterParams[key]) {
        router.setParams(this.props.history, { [key]: filterParams[key] });
      } else {
        router.removeParams(this.props.history, key);
      }
    }

    return router;
  };

  isFiltered = (): boolean => {
    const params = generateQueryParams(this.props.history);

    for (const param in params) {
      if (FILTER_PARAMS.includes(param)) {
        return true;
      }
    }

    return false;
  };

  clearFilter = () => {
    const params = generateQueryParams(this.props.history);
    router.removeParams(this.props.history, ...Object.keys(params));
  };

  render() {
    const {
      putResponsesByDateQuery,
      putResponsesCountQuery,
      putResponsesAmountQuery
    } = this.props;

    if (
      putResponsesByDateQuery.loading ||
      putResponsesCountQuery.loading ||
      putResponsesAmountQuery.loading
    ) {
      return <Spinner />;
    }

    let errorMsg: string = '';
    if (putResponsesByDateQuery.error) {
      errorMsg = putResponsesByDateQuery.error.message;
      Alert.error(errorMsg);
    }

    const searchValue = this.props.queryParams.searchValue || '';
    const putResponses = putResponsesByDateQuery.putResponsesByDate || [];
    const putResponsesCount = putResponsesCountQuery.putResponsesCount || 0;
    const putResponsesAmount = putResponsesAmountQuery.putResponsesAmount || 0;

    const updatedProps = {
      ...this.props,
      errorMsg,
      searchValue,
      putResponses,
      totalCount: putResponsesCount,
      sumAmount: putResponsesAmount,
      loading: putResponsesByDateQuery.loading,

      onFilter: this.onFilter,
      onSelect: this.onSelect,
      onSearch: this.onSearch,
      isFiltered: this.isFiltered(),
      clearFilter: this.clearFilter
    };

    return <PutResponseByDate {...updatedProps} />;
  }
}

const generateParams = ({ queryParams }) => ({
  ...router.generatePaginationParams(queryParams || {}),
  sortField: queryParams.sortField,
  sortDirection: queryParams.sortDirection
    ? parseInt(queryParams.sortDirection, 10)
    : undefined,
  search: queryParams.search,
  contentType: queryParams.contentType,
  success: queryParams.success,
  billType: queryParams.billType,
  billIdRule: queryParams.billIdRule,
  isLast: queryParams.isLast,
  orderNumber: queryParams.orderNumber,
  dealName: queryParams.dealName,
  pipelineId: queryParams.pipelineId,
  stageId: queryParams.stageId,
  createdStartDate: queryParams.createdStartDate,
  createdEndDate: queryParams.createdEndDate,
  paidDate: queryParams.paidDate
});

export default withProps<Props>(
  compose(
    graphql<
      { queryParams: any },
      PutResponsesByDateQueryResponse,
      ListQueryVariables
    >(gql(queries.putResponsesByDate), {
      name: 'putResponsesByDateQuery',
      options: ({ queryParams }) => ({
        variables: generateParams({ queryParams }),
        fetchPolicy: 'network-only'
      })
    }),

    graphql<
      { queryParams: any },
      PutResponsesCountQueryResponse,
      ListQueryVariables
    >(gql(queries.putResponsesCount), {
      name: 'putResponsesCountQuery',
      options: ({ queryParams }) => ({
        variables: generateParams({ queryParams }),
        fetchPolicy: 'network-only'
      })
    }),
    graphql<
      { queryParams: any },
      PutResponsesAmountQueryResponse,
      ListQueryVariables
    >(gql(queries.putResponsesAmount), {
      name: 'putResponsesAmountQuery',
      options: ({ queryParams }) => ({
        variables: generateParams({ queryParams }),
        fetchPolicy: 'network-only'
      })
    })
  )(withRouter<IRouterProps>(PutResponsesContainer))
);
