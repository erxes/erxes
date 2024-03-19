import * as compose from 'lodash.flowright';
import {
  SyncHistoriesQueryResponse,
  SyncHistoriesCountQueryResponse,
  ToCheckMutationResponse,
  ToSyncMutationResponse,
} from '../../types';
import { queries } from '../../graphql';
import { router, withProps } from '@erxes/ui/src/utils/core';
import { IRouterProps } from '@erxes/ui/src/types';
import List from '../components/List';
import React from 'react';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import mutations from '../../graphql/mutations';
import Alert from '@erxes/ui/src/utils/Alert';

type Props = {
  history: any;
  queryParams: any;
  contentType: string;
};
type State = {
  items: any;
  loading: boolean;
};
type FinalProps = {
  syncHistoriesQuery: SyncHistoriesQueryResponse;
  syncHistoriesCountQuery: SyncHistoriesCountQueryResponse;
} & Props &
  ToCheckMutationResponse &
  ToSyncMutationResponse &
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
    const {
      queryParams,
      syncHistoriesQuery,
      syncHistoriesCountQuery,
      contentType,
    } = this.props;
    const { items } = this.state;

    const toCheck = (type: string) => {
      this.setState({ loading: true });
      this.props
        .toCheck({ variables: { type } })
        .then((response) => {
          this.setState({
            items: response.data.toCheck.results.items || [],
          });
          this.setState({ loading: false });
        })
        .catch((e) => {
          Alert.error(e.message);
          this.setState({ loading: false });
        });
    };

    const toSync = (type: string, items: any[]) => {
      this.setState({ loading: true });
      this.props
        .toSync({
          variables: {
            type,
            items,
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
      toCheck,
      toSync,
      syncHistories,
      totalCount,
      items,
      contentType,
      loading: syncHistoriesQuery.loading || syncHistoriesCountQuery.loading,
    };
    return <List {...updatedProps} />;
  }
}

const generateParams = ({ queryParams }, { contentType }) => {
  const pageInfo = router.generatePaginationParams(queryParams || {});
  return {
    page: pageInfo.page || 1,
    perPage: pageInfo.perPage || 20,
    sortField: queryParams.sortField,
    sortDirection: Number(queryParams.sortDirection) || undefined,
    userId: queryParams.userId,
    startDate: queryParams.startDate,
    endDate: queryParams.endDate,
    contentType: contentType,
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
      options: ({ queryParams, contentType }) => ({
        variables: generateParams({ queryParams }, { contentType }),
        fetchPolicy: 'network-only',
      }),
    }),
    graphql<Props, SyncHistoriesCountQueryResponse, {}>(
      gql(queries.syncHistoriesCount),
      {
        name: 'syncHistoriesCountQuery',
        options: ({ queryParams, contentType }) => ({
          variables: generateParams({ queryParams }, { contentType }),
          fetchPolicy: 'network-only',
        }),
      },
    ),
    graphql<Props, ToCheckMutationResponse, {}>(gql(mutations.toCheck), {
      name: 'toCheck',
    }),
    graphql<Props, ToSyncMutationResponse, {}>(gql(mutations.toSync), {
      name: 'toSync',
    }),
  )(CustomerContainer),
);
