import * as compose from 'lodash.flowright';
import {
  SyncHistoriesQueryResponse,
  SyncHistoriesCountQueryResponse,
  ToCheckLoansMutationResponse,
  ToSyncLoansMutationResponse,
} from '../../types';
import { queries } from '../../graphql';
import { router, withProps } from '@erxes/ui/src/utils/core';
import { IRouterProps } from '@erxes/ui/src/types';
import Loan from '../components/Loan';
import React from 'react';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import mutations from '../../graphql/mutations';
import Alert from '@erxes/ui/src/utils/Alert';
type Props = {
  history: any;
  queryParams: any;
};
type State = {
  items: any;
  loading: boolean;
};
type FinalProps = {
  syncHistoriesQuery: SyncHistoriesQueryResponse;
  syncHistoriesCountQuery: SyncHistoriesCountQueryResponse;
} & Props &
  ToCheckLoansMutationResponse &
  ToSyncLoansMutationResponse &
  IRouterProps;

class LoanContainer extends React.Component<FinalProps, State> {
  constructor(props) {
    super(props);

    this.state = {
      items: {},
      loading: false,
    };
  }
  render() {
    const { queryParams, syncHistoriesQuery, syncHistoriesCountQuery } =
      this.props;
    const { items } = this.state;

    const toCheckLoans = () => {
      this.setState({ loading: true });
      this.props
        .toCheckLoans({ variables: {} })
        .then((response) => {
          this.setState({ items: response.data.toCheckLoans });
          this.setState({ loading: false });
        })
        .catch((e) => {
          Alert.error(e.message);
          this.setState({ loading: false });
        });
    };

    const toSyncLoans = (action: string, loans: any[]) => {
      console.log('jejdsklfjs', loans);
      this.setState({ loading: true });
      this.props
        .toSyncLoans({
          variables: {
            action,
            loans,
          },
        })
        .then(() => {
          this.setState({ loading: false });
          Alert.success('Success. Please check again.');
        })
        .catch((e) => {
          Alert.error(e.message);
          this.setState({ loading: false });
        });
    };
    const syncHistories = syncHistoriesQuery.syncHistories || [];
    const totalCount = syncHistoriesCountQuery.syncHistoriesCount || 0;
    const updatedProps = {
      ...this.props,
      queryParams,
      syncHistories,
      totalCount,
      toCheckLoans,
      toSyncLoans,
      items,
      loading: syncHistoriesQuery.loading || syncHistoriesCountQuery.loading,
    };
    return <Loan {...updatedProps} />;
  }
}

const generateParams = ({ queryParams }) => {
  const pageInfo = router.generatePaginationParams(queryParams || {});

  return {
    page: pageInfo.page || 1,
    perPage: pageInfo.perPage || 20,
    sortField: queryParams.sortField,
    sortDirection: Number(queryParams.sortDirection) || undefined,
    userId: queryParams.userId,
    startDate: queryParams.startDate,
    endDate: queryParams.endDate,
    contentType: 'loans:contract',
    contentId: queryParams.contentId,
    searchConsume: queryParams.searchConsume,
    searchSend: queryParams.searchSend,
    searchResponse: queryParams.searchResponse,
    searchError: queryParams.searchError,
  };
};

export default withProps<Props>(
  compose(
    graphql<Props, SyncHistoriesQueryResponse, {}>(gql(queries.syncHistories), {
      name: 'syncHistoriesQuery',
      options: ({ queryParams }) => ({
        variables: generateParams({ queryParams }),
        fetchPolicy: 'network-only',
      }),
    }),
    graphql<Props, SyncHistoriesCountQueryResponse, {}>(
      gql(queries.syncHistoriesCount),
      {
        name: 'syncHistoriesCountQuery',
        options: ({ queryParams }) => ({
          variables: generateParams({ queryParams }),
          fetchPolicy: 'network-only',
        }),
      },
    ),
    graphql<Props, ToCheckLoansMutationResponse, {}>(
      gql(mutations.toCheckLoans),
      {
        name: 'toCheckLoans',
      },
    ),
    graphql<Props, ToSyncLoansMutationResponse, {}>(
      gql(mutations.toSyncLoans),
      {
        name: 'toSyncLoans',
      },
    ),
  )(LoanContainer),
);
