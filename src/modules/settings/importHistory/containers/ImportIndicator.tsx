import gql from 'graphql-tag';
import { withProps } from 'modules/common/utils';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { ImportIndicator } from '../components';
import { queries, subscriptions } from '../graphql';
import { ImportHistoryDetailQueryResponse } from '../types';

const subscription = gql(subscriptions.importSubscription);

type Props = {
  id: string;
  close: () => void;
  importHistoryDetailQuery: ImportHistoryDetailQueryResponse;
};

type State = {
  percentage: number;
};

class ImportIndicatorContainer extends React.Component<Props, State> {
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
          // clear local storage
          localStorage.setItem('erxes_import_data', '');

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

    return (
      <ImportIndicator
        {...this.props}
        percentage={this.state.percentage}
        importHistory={importHistory}
      />
    );
  }
}

export default withProps<{ id: string; close?: () => void }>(
  compose(
    graphql<{ id: string }, ImportHistoryDetailQueryResponse, { _id: string }>(
      gql(queries.historyDetailForLoad),
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
  )(ImportIndicatorContainer)
);
