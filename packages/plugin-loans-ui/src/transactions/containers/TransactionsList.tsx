import { Alert, Bulk, router, withProps } from '@erxes/ui/src';
import { IRouterProps } from '@erxes/ui/src/types';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import queryString from 'query-string';
import React from 'react';
import { graphql } from 'react-apollo';
import { withRouter } from 'react-router-dom';

import { FILTER_PARAMS_TR } from '../../constants';
import TransactionList from '../components/TransactionList';
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
  transactionsMainQuery: MainQueryResponse;
} & Props &
  IRouterProps &
  RemoveMutationResponse;

type State = {
  loading: boolean;
};

const generateQueryParams = ({ location }) => {
  return queryString.parse(location.search);
};

class TransactionListContainer extends React.Component<FinalProps, State> {
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
    const { transactionsMainQuery, transactionsRemove } = this.props;

    const removeTransactions = ({ transactionIds }, emptyBulk) => {
      transactionsRemove({
        variables: { transactionIds }
      })
        .then(() => {
          emptyBulk();
          Alert.success('You successfully deleted a transaction');
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

    const { list = [], totalCount = 0 } =
      transactionsMainQuery.transactionsMain || {};

    const updatedProps = {
      ...this.props,
      totalCount,
      transactions: list,
      loading: transactionsMainQuery.loading || this.state.loading,
      removeTransactions,
      onSelect: this.onSelect,
      onSearch: this.onSearch,
      isFiltered: this.isFiltered(),
      clearFilter: this.clearFilter
    };

    const transactionsList = props => {
      return <TransactionList {...updatedProps} {...props} />;
    };

    const refetch = () => {
      this.props.transactionsMainQuery.refetch();
    };

    return <Bulk content={transactionsList} refetch={refetch} />;
  }
}

const generateParams = ({ queryParams }) => ({
  variables: {
    ...router.generatePaginationParams(queryParams || {}),
    contractId: queryParams.contractId,
    customerId: queryParams.customerId,
    companyId: queryParams.companyId,
    startDate: queryParams.startDate,
    endDate: queryParams.endDate,
    searchValue: queryParams.search,
    payDate: queryParams.payDate,
    contractHasnt: queryParams.contractHasnt,
    ids: queryParams.ids,
    sortField: queryParams.sortField,
    sortDirection: queryParams.sortDirection
      ? parseInt(queryParams.sortDirection, 10)
      : undefined
  }
});

const generateOptions = () => ({
  refetchQueries: ['transactionsMain']
});

export default withProps<Props>(
  compose(
    graphql<Props, MainQueryResponse, ListQueryVariables>(
      gql(queries.transactionsMain),
      {
        name: 'transactionsMainQuery',
        options: generateParams
      }
    ),
    // mutations
    graphql<{}, RemoveMutationResponse, RemoveMutationVariables>(
      gql(mutations.transactionsRemove),
      {
        name: 'transactionsRemove',
        options: generateOptions
      }
    )
  )(withRouter<IRouterProps>(TransactionListContainer))
);
