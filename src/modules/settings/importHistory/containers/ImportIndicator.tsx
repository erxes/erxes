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
  closeLoadingBar: () => void;
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

        console.log(data); // tslint:disable-line

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
      importCancel,
      closeLoadingBar
    } = this.props;

    const importHistory = importHistoryDetailQuery.importHistoryDetail || {};

    const cancelImport = id => {
      confirm().then(() => {
        importCancel({
          variables: { _id: id }
        })
          .then(() => {
            Alert.success('You canceled importing action.');
            closeLoadingBar();
          })
          .catch(e => {
            Alert.error(e.message);
            closeLoadingBar();
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
      gql(mutations.importCancel),
      {
        name: 'importCancel'
      }
    )
  )(ImportIndicatorContainer)
);

const WithConsumer = props => {
  return (
    <AppConsumer>
      {({ closeLoadingBar }) => (
        <ImportIndicatorWithProps
          {...props}
          closeLoadingBar={closeLoadingBar}
        />
      )}
    </AppConsumer>
  );
};

export default WithConsumer;
