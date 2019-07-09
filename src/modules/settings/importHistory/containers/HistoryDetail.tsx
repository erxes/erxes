import gql from 'graphql-tag';
import { withProps } from 'modules/common/utils';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import HistoryDetail from '../components/HistoryDetail';
import { queries, subscriptions } from '../graphql';
import { ImportHistoryDetailQueryResponse } from '../types';

const subscription = gql(subscriptions.importSubscription);

class HistoryDetailContainer extends React.Component<
  { id: string } & {
    importHistoryDetailQuery: ImportHistoryDetailQueryResponse;
  },
  { percentage: number }
> {
  constructor(props) {
    super(props);

    this.state = {
      percentage: 0
    };
  }

  componentWillMount() {
    const { importHistoryDetailQuery, id } = this.props;

    importHistoryDetailQuery.subscribeToMore({
      document: subscription,
      variables: { _id: id },

      updateQuery: (prev, { subscriptionData: { data } }) => {
        const { importHistoryChanged } = data;
        const { percentage, status } = importHistoryChanged;

        if (status === 'Done') {
          return importHistoryDetailQuery.refetch();
        }

        if (percentage.toFixed(0) !== this.state.percentage) {
          this.setState({ percentage: percentage.toFixed(0) });
        }
      }
    });
  }

  render() {
    const { importHistoryDetailQuery } = this.props;
    const importHistory = importHistoryDetailQuery.importHistoryDetail || {};
    const percentage =
      Math.trunc(importHistory.percentage) || this.state.percentage;

    return (
      <HistoryDetail
        importHistory={importHistory}
        loading={importHistoryDetailQuery.loading}
        percentage={percentage}
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
