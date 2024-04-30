import { Alert, Bulk, router, withProps } from '@erxes/ui/src';
import { IRouterProps } from '@erxes/ui/src/types';
import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
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
  closeModal: () => void;
};

type FinalProps = {
  nonBalanceTransactionsMainQuery: MainQueryResponse;
} & Props &
  IRouterProps &
  RemoveMutationResponse;

type State = {
  loading: boolean;
};

class NonBalanceTransactionListContainer extends React.Component<FinalProps, State> {
  constructor(props) {
    super(props);

    this.state = {
      loading: false
    };
  }

  render() {
    const { nonBalanceTransactionsMainQuery, nonBalanceTransactionsRemove, closeModal } = this.props;

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
    const tableHeadName = ['number','description','customer','type']
    const updatedProps = {
      ...this.props,
      totalCount,
      nonBalanceTransactions: list,
      loading: nonBalanceTransactionsMainQuery.loading || this.state.loading,
      removeNonBalanceTransactions,
      tableHeadName: tableHeadName,
      closeModal: closeModal
    };

    const nonBalanceTransactionsList = props => {
      return <List {...updatedProps} {...props} />;
    };

    const refetch = () => {
      this.props.nonBalanceTransactionsMainQuery.refetch();
    };

    return <Bulk content={nonBalanceTransactionsList} refetch={refetch} />;
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
    )(NonBalanceTransactionListContainer)
);