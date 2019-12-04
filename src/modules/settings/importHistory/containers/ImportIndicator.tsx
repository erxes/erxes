import { AppConsumer } from 'appContext';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { Alert, confirm, withProps } from 'modules/common/utils';
import React from 'react';
import { graphql } from 'react-apollo';
import ImportIndicator from '../components/ImportIndicator';
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
  doneIndicatorAction: () => void;
  isRemovingImport: boolean;
};

type State = {
  percentage: number;
  errors?: string[];
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

  clearStorage() {
    // clear local storage
    localStorage.setItem('erxes_import_data', '');
    localStorage.setItem('erxes_import_data_type', '');
  }

  componentWillMount() {
    const { importHistoryDetailQuery, id } = this.props;
    importHistoryDetailQuery.subscribeToMore({
      document: subscription,
      variables: { _id: id },
      updateQuery: (prev, { subscriptionData: { data } }) => {
        const { importHistoryChanged } = data;
        const { percentage, status, errorMsgs } = importHistoryChanged;

        if (status === 'Error') {
          this.clearStorage();

          return this.setState({ errors: errorMsgs });
        }

        if (status === 'Removed') {
          this.clearStorage();

          // for refetch list
          this.props.doneIndicatorAction();
        }

        if (status === 'Done') {
          this.clearStorage();

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
      closeLoadingBar,
      isRemovingImport
    } = this.props;

    const importHistory = importHistoryDetailQuery.importHistoryDetail || {};
    const errors = this.state.errors;
    const percentage =
      Math.trunc(importHistory.percentage) || this.state.percentage;

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
        percentage={percentage}
        importHistory={importHistory}
        cancel={cancelImport}
        isRemovingImport={isRemovingImport}
        errors={errors}
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
      {({ closeLoadingBar, isRemovingImport, doneIndicatorAction }) => (
        <ImportIndicatorWithProps
          {...props}
          closeLoadingBar={closeLoadingBar}
          isRemovingImport={isRemovingImport}
          doneIndicatorAction={doneIndicatorAction}
        />
      )}
    </AppConsumer>
  );
};

export default WithConsumer;
