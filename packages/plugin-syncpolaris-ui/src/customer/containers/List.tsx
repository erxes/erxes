import * as compose from 'lodash.flowright';
import {
  SyncHistoriesQueryResponse,
  SyncHistoriesCountQueryResponse,
  ToCheckCustomersMutationResponse,
  ToSyncCustomersMutationResponse,
} from '../../types';
import { queries } from '../../graphql';
import { router, withProps } from '@erxes/ui/src/utils/core';
import { IRouterProps } from '@erxes/ui/src/types';
import Customer from '../components/Customer';
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
  ToCheckCustomersMutationResponse &
  ToSyncCustomersMutationResponse &
  IRouterProps;

class CustomerContainer extends React.Component<FinalProps, State> {
  constructor(props) {
    super(props);

    this.state = {
      items: [],
      loading: false,
    };
  }
  render() {
    const { queryParams, syncHistoriesQuery, syncHistoriesCountQuery } =
      this.props;
    const { items } = this.state;

    const toCheckCustomers = () => {
      this.setState({ loading: true });
      this.props
        .toCheckCustomers({ variables: {} })
        .then((response) => {
          this.setState({
            items: response.data.toCheckCustomers.diffCustomer.items || [],
          });
          this.setState({ loading: false });
        })
        .catch((e) => {
          Alert.error(e.message);
          this.setState({ loading: false });
        });
    };

    const toSyncCustomers = (action: string, customers: any[]) => {
      this.setState({ loading: true });
      this.props
        .toSyncCustomers({
          variables: {
            action,
            customers,
          },
        })
        .then(() => {
          this.setState({ loading: false });
          Alert.success('Success. Please check again.');
        })
        .finally(() => {
          const data = this.state.items;

          this.setState({ items: data });
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
      toCheckCustomers,
      toSyncCustomers,
      syncHistories,
      totalCount,
      items,
      loading: syncHistoriesQuery.loading || syncHistoriesCountQuery.loading,
    };
    return <Customer {...updatedProps} />;
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
    contentType: 'contacts:customer',
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
    graphql<Props, ToCheckCustomersMutationResponse, {}>(
      gql(mutations.toCheckCustomers),
      {
        name: 'toCheckCustomers',
      },
    ),
    graphql<Props, ToSyncCustomersMutationResponse, {}>(
      gql(mutations.toSyncCustomers),
      {
        name: 'toSyncCustomers',
      },
    ),
  )(CustomerContainer),
);
