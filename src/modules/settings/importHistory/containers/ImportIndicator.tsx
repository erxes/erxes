import { AppConsumer } from 'appContext';
import gql from 'graphql-tag';
import { Alert, confirm, withProps } from 'modules/common/utils';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { ImportIndicator } from '../components';
import { mutations, queries, subscriptions } from '../graphql';
import {
  CancelMutationResponse,
  ImportHistoryDetailQueryResponse
} from '../types';

const subscription = gql(subscriptions.importSubscription);

type Props = {
  id: string;
  close: () => void;
  importHistoryDetailQuery: ImportHistoryDetailQueryResponse;
  closeImportBar: () => void;
};

type State = {
  percentage: number;
};

class ImportIndicatorContainer extends React.Component<
  Props & CancelMutationResponse,
  State
> {
  constructor(props) {
    super(props);

    this.state = {
      percentage: 0
    };
  }

  componentDidMount() {
    this.props.importHistoryDetailQuery.refetch();
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
    const {
      importHistoryDetailQuery,
      importHistoriesCancel,
      closeImportBar
    } = this.props;
    const importHistory = importHistoryDetailQuery.importHistoryDetail || {};

    const cancelImport = id => {
      confirm().then(() => {
        importHistoriesCancel({
          variables: { _id: id }
        })
          .then(() => {
            Alert.success('You canceled importing action.');
            closeImportBar();
          })
          .catch(e => {
            Alert.error(e.message);
            closeImportBar();
          });
      });
    };

    return (
      <ImportIndicator
        {...this.props}
        percentage={this.state.percentage}
        importHistory={importHistory}
        cancel={cancelImport}
      />
    );
  }
}

const ImportIndicatorWithProps = withProps<{ id: string; close?: () => void }>(
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
    ),
    graphql<Props, CancelMutationResponse, { _id: string }>(
      gql(mutations.importHistoriesRemove),
      {
        name: 'importHistoriesCancel'
      }
    )
  )(ImportIndicatorContainer)
);

const WithConsumer = props => {
  return (
    <AppConsumer>
      {({ closeImportBar }) => (
        <ImportIndicatorWithProps {...props} closeImportBar={closeImportBar} />
      )}
    </AppConsumer>
  );
};

export default WithConsumer;
