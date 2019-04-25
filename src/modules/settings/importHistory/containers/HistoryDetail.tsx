import gql from 'graphql-tag';
import { withProps } from 'modules/common/utils';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { HistoryDetail } from '../components';
import { queries, subscriptions } from '../graphql';
import { ImportHistoryDetailQueryResponse } from '../types';

const subscription = gql(subscriptions.importSubscription);

class HistoryDetailContainer extends React.Component<
  { id: string } & {
    importHistoryDetailQuery: ImportHistoryDetailQueryResponse;
  }
> {
  componentWillMount() {
    const { importHistoryDetailQuery, id } = this.props;

    importHistoryDetailQuery.subscribeToMore({
      document: subscription,
      variables: { _id: id },
      updateQuery: (prev, { subscriptionData: { data } }) => {
        const { importHistoryChanged } = data;
        const { status } = importHistoryChanged;

        if (status === 'Done') {
          return importHistoryDetailQuery.refetch();
        }
      }
    });
  }

  render() {
    const { importHistoryDetailQuery } = this.props;
    const importHistory = importHistoryDetailQuery.importHistoryDetail || {};

    return (
      <HistoryDetail
        importHistory={importHistory}
        loading={importHistoryDetailQuery.loading}
      />
    );
  }
}

export default withProps<{ id: string }>(
  compose(
    graphql<{ id: string }, ImportHistoryDetailQueryResponse, { _id: string }>(
      gql(queries.historyDetail),
      {
        name: 'importHistoryDetailQuery',
        options: ({ id }) => ({
          fetchPolicy: 'network-only',
          variables: {
            _id: id
          },
          pollInterval: 20000
        })
      }
    )
  )(HistoryDetailContainer)
);
