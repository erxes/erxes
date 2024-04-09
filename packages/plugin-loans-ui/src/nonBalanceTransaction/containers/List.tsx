import { Alert, Bulk, router, withProps } from '@erxes/ui/src';
import { IRouterProps } from '@erxes/ui/src/types';
import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import queryString from 'query-string';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';

import { FILTER_PARAMS_TR } from '../../constants';
import List from '../components/List';
import { mutations, queries } from '../graphql';
import {
  ListQueryVariables,
  MainQueryResponse,
  RemoveMutationResponse,
  RemoveMutationVariables
} from '../types';

type Props = {
  queryParams: any;
  history: any;
};

type FinalProps = {
  nonBalanceTransactionsMainQuery: MainQueryResponse;
} & Props &
  IRouterProps &
  RemoveMutationResponse;

type State = {
  loading: boolean;
};

const generateQueryParams = ({ location }) => {
  return queryString.parse(location.search);
};

class ListContainer extends React.Component<FinalProps, State> {
  constructor(props) {
    super(props);

    this.state = {
      loading: false
    };
  }

  onSearch = (search: string) => {
    if (!search) {
      return router.removeParams(this.props.history, 'search');
    }

    router.setParams(this.props.history, { search });
  };

  onSelect = (values: string[] | string, key: string) => {
    const params = generateQueryParams(this.props.history);

    if (params[key] === values) {
      return router.removeParams(this.props.history, key);
    }
    return router.setParams(this.props.history, { [key]: values });
  };

  isFiltered = (): boolean => {
    const params = generateQueryParams(this.props.history);

    for (const param in params) {
      if (FILTER_PARAMS_TR.includes(param)) {
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
    const { nonBalanceTransactionsMainQuery, nonBalanceTransactionsRemove } = this.props;

    const removeNonBalanceTransactions = ({ nonBalanceTransactionIds }, emptyBulk) => {
      nonBalanceTransactionsRemove({
        variables: { nonBalanceTransactionIds }
      })
        .then(() => {
          emptyBulk();
          Alert.success('You successfully deleted a non balance transaction');
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };
    const { list = [], totalCount = 0 } =
    nonBalanceTransactionsMainQuery.nonBalanceTransactionsMain || {};
      
    const updatedProps = {
      ...this.props,
      totalCount,
      nonBalanceTransactions: list,
      loading: nonBalanceTransactionsMainQuery.loading || this.state.loading,
      removeNonBalanceTransactions,
      onSelect: this.onSelect,
      onSearch: this.onSearch,
      isFiltered: this.isFiltered(),
      clearFilter: this.clearFilter
    };

    const transactionsList = props => {
      return <List {...updatedProps} {...props} />;
    };

    const refetch = () => {
      this.props.nonBalanceTransactionsMainQuery.refetch();
    };

    return <Bulk content={transactionsList} refetch={refetch} />;
  }
}

const generateParams = ({ queryParams }) => ({
  variables: {
    ...router.generatePaginationParams(queryParams || {}),
    contractId: queryParams.contractId,
    customerId: queryParams.customerId,
    startDate: queryParams.startDate,
    endDate: queryParams.endDate,
    searchValue: queryParams.search,
    ids: queryParams.ids,
    sortField: queryParams.sortField,
    sortDirection: queryParams.sortDirection
      ? parseInt(queryParams.sortDirection, 10)
      : undefined
  }
});

const generateOptions = () => ({
  refetchQueries: ['nonBalanceTransactionsMain']
});

export default withProps<Props>(
  compose(
    graphql<Props, MainQueryResponse, ListQueryVariables>(
      gql(queries.nonBalanceTransactionsMain),
      {
        name: 'nonBalanceTransactionsMainQuery',
        options: generateParams
      }
    ),
    // mutations
    graphql<{}, RemoveMutationResponse, RemoveMutationVariables>(
      gql(mutations.nonBalanceTransactionsRemove),
      {
        name: 'nonBalanceTransactionsRemove',
        options: generateOptions
      }
    )
    )(ListContainer)
);
